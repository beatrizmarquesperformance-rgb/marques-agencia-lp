import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Netlify DB injects NETLIFY_DATABASE_URL; DATABASE_URL is the fallback. */
const url = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

/** Null when no database is configured — the site then runs from seed content. */
export const prisma: PrismaClient | null = url
  ? globalForPrisma.prisma ??
    new PrismaClient({ datasources: { db: { url } } })
  : null;

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}

export const hasDb = prisma !== null;
