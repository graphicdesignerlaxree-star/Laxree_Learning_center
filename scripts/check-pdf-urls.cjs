const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const modules = await prisma.module.findMany({
    where: { pdfUrl: { not: null } },
    select: { id: true, title: true, pdfUrl: true }
  });
  console.log(JSON.stringify(modules, null, 2));
  await prisma.$disconnect();
})();
