import { getServerSession } from "next-auth";
import type { Role } from "@prisma/client";
import { authOptions } from "./authOptions";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export function assertRole(userRole: Role, allowed: Role[]) {
  if (!allowed.includes(userRole)) {
    throw new Error("Forbidden");
  }
}
