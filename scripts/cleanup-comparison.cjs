process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.DIRECT_URL = 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Delete the leftover comparison module (content is now inside Minibar chapter)
  const deleted = await prisma.module.deleteMany({
    where: { title: { contains: 'Godrej Qube Comparison' } }
  });
  console.log(`🗑️ Deleted ${deleted.count} leftover comparison module(s)`);

  // Renumber remaining modules
  const paCourse = await prisma.course.findFirst({ where: { moduleType: 'PRODUCT_ACADEMY' } });
  const allModules = await prisma.module.findMany({
    where: { courseId: paCourse.id },
    orderBy: { order: 'asc' }
  });

  console.log('\n📊 FINAL MODULE LIST (after cleanup):');
  for (let i = 0; i < allModules.length; i++) {
    await prisma.module.update({
      where: { id: allModules[i].id },
      data: { order: i + 1 }
    });
    console.log(`  [${i + 1}] ${allModules[i].title} | Video: ${allModules[i].contentType === 'video' ? '✅' : '❌'} | PDF: ${allModules[i].pdfUrl ? '✅' : '❌'}`);
  }

  console.log(`\n✅ Total: ${allModules.length} modules`);
  await prisma.$disconnect();
}

main().catch(e => { console.error('ERROR:', e); process.exit(1); });
