import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CompaniesPage() {
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

  const companies = await prisma.company.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Компании</h1>
      <div className="rounded-lg bg-white p-6 shadow">
        <ul className="space-y-2 text-sm">
          {companies.map((company) => (
            <li key={company.id} className="flex items-center justify-between">
              <span>{company.name}</span>
              <span className="text-slate-500">{company.domain ?? "-"}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
