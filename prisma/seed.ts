import { PrismaClient, TicketPriority, TicketSource, TicketStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeDueAt } from "../lib/sla";

const prisma = new PrismaClient();

async function main() {
  const acme = await prisma.company.create({
    data: {
      name: "Acme Corp",
      domain: "acme.test"
    }
  });

  const beta = await prisma.company.create({
    data: {
      name: "Beta LLC",
      domain: "beta.test"
    }
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      companyId: acme.id,
      name: "Admin User",
      email: "admin@acme.test",
      passwordHash,
      role: Role.ADMIN
    }
  });

  const engineer = await prisma.user.create({
    data: {
      companyId: acme.id,
      name: "Engineer One",
      email: "eng@acme.test",
      passwordHash,
      role: Role.ENGINEER
    }
  });

  const clientUser = await prisma.user.create({
    data: {
      companyId: beta.id,
      name: "Client User",
      email: "user@beta.test",
      passwordHash,
      role: Role.CLIENT_USER
    }
  });

  for (const company of [acme, beta]) {
    await prisma.sLAProfile.createMany({
      data: [
        {
          companyId: company.id,
          name: "Low",
          priority: TicketPriority.LOW,
          responseMinutes: 240,
          resolutionMinutes: 1440
        },
        {
          companyId: company.id,
          name: "Medium",
          priority: TicketPriority.MEDIUM,
          responseMinutes: 120,
          resolutionMinutes: 720
        },
        {
          companyId: company.id,
          name: "High",
          priority: TicketPriority.HIGH,
          responseMinutes: 60,
          resolutionMinutes: 360
        },
        {
          companyId: company.id,
          name: "Critical",
          priority: TicketPriority.CRITICAL,
          responseMinutes: 30,
          resolutionMinutes: 120
        }
      ]
    });

    await prisma.category.createMany({
      data: [
        { companyId: company.id, name: "Email" },
        { companyId: company.id, name: "Network" }
      ]
    });
  }

  const slaProfile = await prisma.sLAProfile.findFirst({
    where: { companyId: beta.id, priority: TicketPriority.HIGH }
  });

  const dueAt = computeDueAt(new Date(), slaProfile?.resolutionMinutes ?? 240);

  await prisma.ticket.create({
    data: {
      companyId: beta.id,
      requesterId: clientUser.id,
      assigneeId: engineer.id,
      title: "VPN не подключается",
      description: "Пользователь не может подключиться к VPN.",
      priority: TicketPriority.HIGH,
      status: TicketStatus.NEW,
      source: TicketSource.WEB,
      dueAt,
      lastActivityAt: new Date(),
      statusHistory: {
        create: { status: TicketStatus.NEW }
      }
    }
  });

  console.log({ admin: admin.email, engineer: engineer.email, client: clientUser.email });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
