import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { publish } from "@/lib/events";

const schema = z.object({
  content: z.string().min(1)
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

  const comment = await prisma.ticketComment.create({
    data: {
      ticketId: params.id,
      authorId: user.id,
      content: body.content
    }
  });

  await publish({ type: "ticket.commented", payload: { ticketId: params.id, commentId: comment.id } });

  return NextResponse.json({ comment }, { status: 201 });
}
