import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

const schema = z.object({
  minutes: z.number().min(1),
  note: z.string().optional()
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  const user = session.user as any;
  const body = schema.parse(await request.json());

  const ticket = await prisma.ticket.findFirst({
    where: { id: params.id, companyId: user.companyId }
  });

  if (!ticket) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const workLog = await prisma.workLog.create({
    data: {
      ticketId: params.id,
      engineerId: user.id,
      minutes: body.minutes,
      note: body.note
    }
  });

  return NextResponse.json({ workLog }, { status: 201 });
}
