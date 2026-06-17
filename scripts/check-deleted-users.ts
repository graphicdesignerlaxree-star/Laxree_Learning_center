import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ datasourceUrl: 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require' })
console.log('=== ALL USERS IN DB ===')
const users = await prisma.user.findMany({
  select: { id: true, email: true, fullName: true, role: true, isActive: true, isSuspended: true, createdAt: true },
  orderBy: { createdAt: 'desc' }
})
for (const u of users) {
  console.log(`${u.fullName || u.email} | ${u.email} | ${u.role} | active=${u.isActive} | suspended=${u.isSuspended} | created=${u.createdAt.toISOString()}`)
}
console.log(`\nTotal users: ${users.length}`)

// Search specifically for Girish or Jitendra
console.log('\n=== SEARCH FOR GIRISH/JITENDRA ===')
const matches = await prisma.user.findMany({
  where: {
    OR: [
      { fullName: { contains: 'Girish', mode: 'insensitive' } },
      { fullName: { contains: 'Jitendra', mode: 'insensitive' } },
      { email: { contains: 'girish', mode: 'insensitive' } },
      { email: { contains: 'jitendra', mode: 'insensitive' } },
    ]
  },
  select: { id: true, email: true, fullName: true, isActive: true, isSuspended: true }
})
console.log(`Found ${matches.length} matches:`)
console.log(JSON.stringify(matches, null, 2))

await prisma.$disconnect()
