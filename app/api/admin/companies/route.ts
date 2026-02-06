import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, assertRole } from "@/lib/auth";

export async function GET() {
  const session = await requireSession();
  assertRole((session.user as any).role, ["ADMIN"]);

  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" }
  });

  return NextResponse.json({ companies });
}

export async function POST(request: Request) {
  const session = await requireSession();
  assertRole((session.user as any).role, ["ADMIN"]);

  const body = await request.json();
  const company = await prisma.company.create({
    data: {
      name: body.name,
      domain: body.domain
    }
  });

  return NextResponse.json({ company }, { status: 201 });
}
