import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { computeBreach } from "@/lib/sla";
import { publish } from "@/lib/events";

const updateSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "WAITING_FOR_CLIENT", "RESOLVED", "CLOSED", "REOPENED"]).optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  categoryId: z.string().optional(),
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional()
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  const user = session.user as any;

  const ticket = await prisma.ticket.findFirst({
    where: {
      id: params.id,
      companyId: user.role === "ADMIN" ? undefined : user.companyId
    },
    include: {
      assignee: true,
      requester: true,
      category: true,
      comments: { include: { author: true }, orderBy: { createdAt: "desc" } },
      workLogs: { include: { engineer: true }, orderBy: { createdAt: "desc" } },
      attachments: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
      tags: { include: { tag: true } }
    }
  });

  if (!ticket) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ticket: { ...ticket, sla: computeBreach(ticket.dueAt, new Date()) } });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  const user = session.user as any;
  const body = updateSchema.parse(await request.json());

  const ticket = await prisma.ticket.findFirst({
    where: {
      id: params.id,
      companyId: user.role === "ADMIN" ? undefined : user.companyId
    }
  });

  if (!ticket) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const updated = await prisma.ticket.update({
    where: { id: params.id },
    data: {
      ...body,
      statusHistory: body.status ? { create: { status: body.status } } : undefined,
      lastActivityAt: new Date(),
      closedAt: body.status === "CLOSED" ? new Date() : undefined
    }
  });

  if (body.assigneeId) {
    await publish({ type: "ticket.assigned", payload: { ticketId: updated.id, assigneeId: body.assigneeId } });
  }

  if (body.status) {
    await publish({ type: "ticket.status_changed", payload: { ticketId: updated.id, status: body.status } });
  }

  return NextResponse.json({ ticket: updated });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  const user = session.user as any;

  const ticket = await prisma.ticket.findFirst({
    where: {
      id: params.id,
      companyId: user.role === "ADMIN" ? undefined : user.companyId
    }
  });

  if (!ticket) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await prisma.ticket.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
