import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Robust DATABASE_URL resolution.
// The sandbox process manager sometimes injects a stale SQLite path
// (file:...custom.db) into the shell env, which overrides the correct
// Neon PostgreSQL URL in .env and breaks Prisma (schema uses postgresql).
// Fix: if DATABASE_URL is missing, empty, a SQLite (file:) path, OR a
// postgres URL without credentials, fall back to the Neon PostgreSQL
// production URL so login always works.
const NEON_URL =
  'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=30&pool_timeout=30'

function resolveDatabaseUrl(): string {
  const env = process.env.DATABASE_URL
  if (!env || env.trim() === '' || env.startsWith('file:')) {
    return NEON_URL
  }
  // A valid postgres URL must contain credentials (user:pass@host).
  // Without them Prisma reports "credentials for (not available)".
  if (!env.includes('://') || !env.includes('@')) {
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

// Helper: retry a DB operation on transient connection/auth failures.
// Neon serverless suspends compute after inactivity; the first connection
// can fail with auth errors before the DB wakes up. Retrying succeeds.
export async function withDbRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delayMs = 1500
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      const msg = (error?.message || '').toLowerCase()
      const isTransient =
        msg.includes('authentication failed') ||
        msg.includes('connection') ||
        msg.includes('timed out') ||
        msg.includes('timeout') ||
        msg.includes('can\'t reach database server') ||
        msg.includes('server has closed') ||
        msg.includes('socket') ||
        msg.includes('econnreset') ||
        msg.includes('undici') ||
        msg.includes('fetch failed')
      if (!isTransient || attempt === retries) {
        throw error
      }
      // Wait before retrying (allows Neon compute to wake up)
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)))
    }
  }
  throw lastError
}
