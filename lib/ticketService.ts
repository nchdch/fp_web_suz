import { prisma } from "./prisma";
import { computeDueAt } from "./sla";
import { publish } from "./events";

export async function createTicket(input: {
  companyId: string;
  requesterId: string;
  title: string;
  description: string;
  categoryId?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  source: "WEB" | "EMAIL" | "PHONE";
}) {
  const slaProfile = await prisma.sLAProfile.findFirst({
    where: {
      companyId: input.companyId,
      priority: input.priority
    }
  });

  const dueAt = computeDueAt(new Date(), slaProfile?.resolutionMinutes ?? 240);

  const ticket = await prisma.ticket.create({
    data: {
      companyId: input.companyId,
      requesterId: input.requesterId,
      title: input.title,
      description: input.description,
      categoryId: input.categoryId,
      priority: input.priority,
      status: "NEW",
      source: input.source,
      dueAt,
      lastActivityAt: new Date(),
      statusHistory: {
        create: { status: "NEW" }
      }
    }
  });

  await publish({ type: "ticket.created", payload: { ticketId: ticket.id, companyId: ticket.companyId } });

  return ticket;
}
