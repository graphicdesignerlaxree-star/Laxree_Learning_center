const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasourceUrl: 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require' });

(async () => {
  // Map titles containing keywords to public PDF URLs
  const updates = [
    { match: 'Mini Bar', url: '/pdfs/mini-bar.pdf' },
    { match: 'Safe Box', url: '/pdfs/safe-box.pdf' },
    { match: 'Kettle', url: '/pdfs/electric-kettle.pdf' },
  ];

  for (const { match, url } of updates) {
    const result = await prisma.module.updateMany({
      where: { title: { contains: match, mode: 'insensitive' } },
      data: { pdfUrl: url }
    });
    console.log(`Updated ${result.count} modules matching "${match}" to ${url}`);
  }

  // Verify
  const modules = await prisma.module.findMany({
    where: { pdfUrl: { not: null } },
    select: { title: true, pdfUrl: true }
  });
  console.log('\nVerification:');
  console.log(JSON.stringify(modules, null, 2));

  await prisma.$disconnect();
})();
