import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { computeBreach } from "@/lib/sla";

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
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
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: params.id,
      companyId: user.role === "ADMIN" ? undefined : user.companyId
    },
    include: {
      assignee: true,
      requester: true,
      comments: { include: { author: true }, orderBy: { createdAt: "desc" } },
      workLogs: { include: { engineer: true }, orderBy: { createdAt: "desc" } },
      attachments: true,
      statusHistory: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!ticket) {
    return <div className="rounded-lg bg-white p-6 shadow">Тикет не найден.</div>;
  }

  const sla = computeBreach(ticket.dueAt, new Date());

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{ticket.title}</h1>
            <p className="text-sm text-slate-500">{ticket.description}</p>
          </div>
          <span className={`rounded px-3 py-1 text-xs ${sla.breached ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
            {sla.breached ? `SLA нарушен (${sla.overdueMinutes}м)` : "SLA в норме"}
          </span>
        </div>
        <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
          <div>
            <p className="text-slate-500">Статус</p>
            <p>{ticket.status}</p>
          </div>
          <div>
            <p className="text-slate-500">Приоритет</p>
            <p>{ticket.priority}</p>
          </div>
          <div>
            <p className="text-slate-500">Исполнитель</p>
            <p>{ticket.assignee?.name ?? "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Создатель</p>
            <p>{ticket.requester.name}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-sm font-semibold">Комментарии</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {ticket.comments.map((comment) => (
              <li key={comment.id} className="rounded border p-3">
                <p className="font-medium">{comment.author.name}</p>
                <p className="text-slate-600">{comment.content}</p>
              </li>
            ))}
            {ticket.comments.length === 0 ? <li className="text-slate-500">Нет комментариев</li> : null}
          </ul>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-sm font-semibold">Worklog</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {ticket.workLogs.map((log) => (
              <li key={log.id} className="rounded border p-3">
                <p className="font-medium">{log.engineer.name}</p>
                <p className="text-slate-600">{log.minutes} минут</p>
                {log.note ? <p className="text-slate-500">{log.note}</p> : null}
              </li>
            ))}
            {ticket.workLogs.length === 0 ? <li className="text-slate-500">Нет записей</li> : null}
          </ul>
        </div>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-sm font-semibold">История статусов</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {ticket.statusHistory.map((entry) => (
            <li key={entry.id}>{entry.status} — {entry.createdAt.toLocaleString()}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
