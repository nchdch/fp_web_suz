export type DomainEvent =
  | { type: "ticket.created"; payload: { ticketId: string; companyId: string } }
  | { type: "ticket.assigned"; payload: { ticketId: string; assigneeId: string } }
  | { type: "ticket.status_changed"; payload: { ticketId: string; status: string } }
  | { type: "ticket.commented"; payload: { ticketId: string; commentId: string } }
  | { type: "ticket.sla_breach"; payload: { ticketId: string; overdueMinutes: number } };

export type EventHandler = (event: DomainEvent) => Promise<void> | void;

const handlers: EventHandler[] = [];

export function registerHandler(handler: EventHandler) {
  handlers.push(handler);
}

export async function publish(event: DomainEvent) {
  for (const handler of handlers) {
    await handler(event);
  }
}
