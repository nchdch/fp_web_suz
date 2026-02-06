import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

const schema = z.object({
  filename: z.string().min(1),
  url: z.string().url()
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

  const attachment = await prisma.attachment.create({
    data: {
      ticketId: params.id,
      uploaderId: user.id,
      filename: body.filename,
      url: body.url
    }
  });

  return NextResponse.json({ attachment }, { status: 201 });
}
