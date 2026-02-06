import { DomainEvent, registerHandler } from "./events";

export type EmailMessage = {
  to: string;
  subject: string;
  body: string;
};

export class EmailProviderStub {
  async send(message: EmailMessage) {
    console.info("[EmailStub]", message);
  }
}

const provider = new EmailProviderStub();

export function initEmailHandlers() {
  registerHandler(async (event: DomainEvent) => {
    switch (event.type) {
      case "ticket.created":
        await provider.send({
          to: "ops@example.com",
          subject: `New ticket ${event.payload.ticketId}`,
          body: "Ticket created"
        });
        break;
      case "ticket.assigned":
        await provider.send({
          to: "engineer@example.com",
          subject: "Ticket assigned",
          body: `Ticket ${event.payload.ticketId} assigned`
        });
        break;
      case "ticket.status_changed":
        await provider.send({
          to: "client@example.com",
          subject: "Ticket status update",
          body: `Ticket ${event.payload.ticketId} status changed to ${event.payload.status}`
        });
        break;
      case "ticket.commented":
        await provider.send({
          to: "client@example.com",
          subject: "New comment",
          body: `Comment ${event.payload.commentId}`
        });
        break;
      case "ticket.sla_breach":
        await provider.send({
          to: "ops@example.com",
          subject: "SLA breached",
          body: `Ticket ${event.payload.ticketId} overdue ${event.payload.overdueMinutes}m`
        });
        break;
      default:
        break;
    }
  });
}
