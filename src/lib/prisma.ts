import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma() {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  if (!tursoUrl) return new PrismaClient();
  const adapter = new PrismaLibSQL({
    url: tursoUrl,
    authToken: process.env.TURSO_AUTH_TOKEN?.trim() || undefined,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
