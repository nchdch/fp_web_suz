import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { computeBreach } from "@/lib/sla";
import { initEmailHandlers } from "@/lib/email";
import { createTicket } from "@/lib/ticketService";

initEmailHandlers();

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  categoryId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  source: z.enum(["WEB", "EMAIL", "PHONE"])
});

export async function GET(request: Request) {
  const session = await requireSession();
  const user = session.user as any;
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status") || undefined;
  const priority = searchParams.get("priority") || undefined;
  const companyId = user.role === "ADMIN" ? searchParams.get("companyId") || undefined : user.companyId;
  const assigneeId = searchParams.get("assigneeId") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const search = searchParams.get("search") || undefined;
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 20);

  const where = {
    companyId,
    status: status as any,
    priority: priority as any,
    assigneeId,
    categoryId,
    OR: search
      ? [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } }
        ]
      : undefined
  };

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: { assignee: true, requester: true, category: true, tags: { include: { tag: true } } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.ticket.count({ where })
  ]);

  const now = new Date();
  const withSla = tickets.map((ticket) => ({
    ...ticket,
    sla: computeBreach(ticket.dueAt, now)
  }));

  return NextResponse.json({ tickets: withSla, total, page, pageSize });
}

export async function POST(request: Request) {
  const session = await requireSession();
  const user = session.user as any;
  const body = createSchema.parse(await request.json());

  const ticket = await createTicket({
    companyId: user.companyId,
    requesterId: user.id,
    title: body.title,
    description: body.description,
    categoryId: body.categoryId,
    priority: body.priority,
    source: body.source
  });

  return NextResponse.json({ ticket }, { status: 201 });
}
