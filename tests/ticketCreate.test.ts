import { describe, expect, it, vi } from "vitest";

const prismaMock = {
  sLAProfile: {
    findFirst: vi.fn(async () => ({ resolutionMinutes: 120 }))
  },
  ticket: {
    create: vi.fn(async (args: any) => ({ id: "t1", companyId: args.data.companyId }))
  }
};

vi.mock("../lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("../lib/events", () => ({ publish: vi.fn() }));

import { createTicket } from "../lib/ticketService";

describe("ticket creation integration", () => {
  it("creates ticket with SLA", async () => {
    const ticket = await createTicket({
      companyId: "c1",
      requesterId: "u1",
      title: "VPN",
      description: "VPN down",
      priority: "HIGH",
      source: "WEB"
    });

    expect(ticket.id).toBe("t1");
    expect(prismaMock.ticket.create).toHaveBeenCalled();
  });
});
