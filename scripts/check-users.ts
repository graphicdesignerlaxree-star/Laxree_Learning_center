import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ datasourceUrl: 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require' })
const users = await prisma.user.findMany({
  where: { email: { contains: 'laxree' } },
  select: { email: true, password: true, role: true, fullName: true, isActive: true }
})
console.log(JSON.stringify(users, null, 2))
await prisma.$disconnect()
