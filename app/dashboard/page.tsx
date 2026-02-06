import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { computeBreach } from "@/lib/sla";

export default async function DashboardPage() {
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

  const user = session.user as any;
  const where = user.role === "ADMIN" ? {} : { companyId: user.companyId };
  const [myTickets, companyTickets, overdueTickets, newTickets] = await Promise.all([
    prisma.ticket.count({ where: { ...where, assigneeId: user.id } }),
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({ where, select: { dueAt: true } }),
    prisma.ticket.count({ where: { ...where, status: "NEW" } })
  ]);

  const overdueCount = overdueTickets.filter((ticket) => computeBreach(ticket.dueAt, new Date()).breached).length;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-sm text-slate-500">Мои тикеты</h2>
        <p className="text-3xl font-semibold">{myTickets}</p>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-sm text-slate-500">Тикеты компании</h2>
        <p className="text-3xl font-semibold">{companyTickets}</p>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-sm text-slate-500">Просроченные</h2>
        <p className="text-3xl font-semibold text-red-600">{overdueCount}</p>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-sm text-slate-500">Новые тикеты</h2>
        <p className="text-3xl font-semibold">{newTickets}</p>
      </div>
    </div>
  );
}
