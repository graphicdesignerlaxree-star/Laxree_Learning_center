import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ datasourceUrl: 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require' })
const user = await prisma.user.findUnique({
  where: { email: 'emp002@laxree.com' },
  select: { email: true, password: true, isActive: true, isSuspended: true }
})
console.log('User:', JSON.stringify(user, null, 2))
console.log('Password length:', user?.password?.length)
console.log('Password bytes:', Buffer.from(user?.password || '', 'utf8').toString('hex'))
await prisma.$disconnect()
