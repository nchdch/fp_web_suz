import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSession, assertRole } from "@/lib/auth";

export async function GET() {
  const session = await requireSession();
  assertRole((session.user as any).role, ["ADMIN"]);

  const users = await prisma.user.findMany({
    include: { company: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const session = await requireSession();
  assertRole((session.user as any).role, ["ADMIN"]);

  const body = await request.json();
  const passwordHash = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      role: body.role,
      companyId: body.companyId,
      passwordHash
    }
  });

  return NextResponse.json({ user }, { status: 201 });
}
