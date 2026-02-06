import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { computeBreach } from "@/lib/sla";

export default async function TicketsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
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
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const priority = typeof searchParams.priority === "string" ? searchParams.priority : undefined;
  const page = Number(typeof searchParams.page === "string" ? searchParams.page : 1);
  const pageSize = 10;

  const where = {
    companyId: user.role === "ADMIN" ? undefined : user.companyId,
    status: status as any,
    priority: priority as any
  };

  const tickets = await prisma.ticket.findMany({
    where,
    include: { assignee: true, requester: true },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Тикеты</h1>
        <Link href="/tickets/new" className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
          Создать
        </Link>
      </div>
      <div className="rounded-lg bg-white shadow">
        <div className="grid grid-cols-6 gap-4 border-b px-4 py-2 text-xs uppercase text-slate-500">
          <span>ID</span>
          <span>Заголовок</span>
          <span>Приоритет</span>
          <span>Статус</span>
          <span>Исполнитель</span>
          <span>SLA</span>
        </div>
        {tickets.map((ticket) => {
          const sla = computeBreach(ticket.dueAt, new Date());
          return (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="grid grid-cols-6 gap-4 border-b px-4 py-3 text-sm hover:bg-slate-50"
            >
              <span className="truncate">{ticket.id.slice(0, 6)}</span>
              <span className="truncate">{ticket.title}</span>
              <span>{ticket.priority}</span>
              <span>{ticket.status}</span>
              <span>{ticket.assignee?.name ?? "-"}</span>
              <span className={sla.breached ? "text-red-600" : "text-emerald-600"}>
                {sla.breached ? `Просрочено ${sla.overdueMinutes}м` : "В норме"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
