import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ datasourceUrl: 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require' })
const modules = await prisma.module.findMany({
  where: { pdfUrl: { not: null } },
  select: { id: true, title: true, pdfUrl: true }
})
console.log(JSON.stringify(modules, null, 2))
await prisma.$disconnect()
