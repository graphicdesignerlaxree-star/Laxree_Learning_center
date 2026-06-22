const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasourceUrl: 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require' });

(async () => {
  // Update all Minibar/Mini Bar modules
  const result1 = await prisma.module.updateMany({
    where: { OR: [
      { title: { contains: 'Minibar', mode: 'insensitive' } },
      { title: { contains: 'Mini Bar', mode: 'insensitive' } },
    ]},
    data: { pdfUrl: '/pdfs/mini-bar.pdf' }
  });
  console.log(`Updated ${result1.count} Minibar modules`);

  // Verify
  const modules = await prisma.module.findMany({
    where: { pdfUrl: { not: null } },
    select: { title: true, pdfUrl: true }
  });
  console.log('\nVerification:');
  console.log(JSON.stringify(modules, null, 2));

  await prisma.$disconnect();
})();
