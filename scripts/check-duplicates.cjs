process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.DIRECT_URL = 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const paCourse = await prisma.course.findFirst({ where: { moduleType: 'PRODUCT_ACADEMY' } });
  console.log('Product Academy Course:', paCourse?.id, paCourse?.title);
  
  const modules = await prisma.module.findMany({
    where: { courseId: paCourse.id },
    orderBy: { order: 'asc' },
    include: { productCategory: true }
  });
  
  console.log('\n=== ALL PRODUCT ACADEMY MODULES ===');
  for (const m of modules) {
    console.log(`\n[${m.order}] ID: ${m.id}`);
    console.log(`  Title: ${m.title}`);
    console.log(`  ContentType: ${m.contentType}`);
    console.log(`  ContentUrl: ${m.contentUrl}`);
    console.log(`  PdfUrl: ${m.pdfUrl}`);
    console.log(`  Category: ${m.productCategory?.name || 'none'}`);
    console.log(`  Content length: ${m.content?.length || 0} chars`);
  }
  
  await prisma.$disconnect();
}

main().catch(e => { console.error('ERROR:', e); process.exit(1); });
