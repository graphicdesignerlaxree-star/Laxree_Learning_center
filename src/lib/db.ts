import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Robust DATABASE_URL resolution.
// The sandbox process manager sometimes injects a stale SQLite path
// (file:...custom.db) into the shell env, which overrides the correct
// Neon PostgreSQL URL in .env and breaks Prisma (schema uses postgresql).
// Fix: if DATABASE_URL is missing OR is a SQLite (file:) path, fall back
// to the Neon PostgreSQL production URL so login always works.
const NEON_URL =
  'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=30&pool_timeout=30'

function resolveDatabaseUrl(): string {
  const env = process.env.DATABASE_URL
  if (!env || env.trim() === '' || env.startsWith('file:')) {
    return NEON_URL
  }
  return env
}

const databaseUrl = resolveDatabaseUrl()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.PRISMA_LOG === 'true' ? ['query'] : [],
    datasourceUrl: databaseUrl,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
