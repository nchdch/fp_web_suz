import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <p>
          Пожалуйста, <Link href="/login" className="text-blue-600">войдите</Link>.
        </p>
      </div>
    );
  }

  const users = await prisma.user.findMany({ include: { company: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Пользователи</h1>
      <div className="rounded-lg bg-white p-6 shadow">
        <ul className="space-y-2 text-sm">
          {users.map((user) => (
            <li key={user.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-slate-500">{user.email}</p>
              </div>
              <div className="text-right text-slate-500">
                <p>{user.role}</p>
                <p>{user.company.name}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
