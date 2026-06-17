// Update pdfUrl for Minibar, Safe Box, and Kettle modules
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
    },
  },
})

async function main() {
  console.log('Connecting to database...')
  
  // Find modules matching Minibar, Safe Box, Kettle (case-insensitive)
  const modules = await prisma.module.findMany({
    where: {
      OR: [
        { title: { contains: 'Minibar', mode: 'insensitive' } },
        { title: { contains: 'Mini Bar', mode: 'insensitive' } },
        { title: { contains: 'Safe Box', mode: 'insensitive' } },
        { title: { contains: 'SafeBox', mode: 'insensitive' } },
        { title: { contains: 'Safe Lock', mode: 'insensitive' } },
        { title: { contains: 'Kettle', mode: 'insensitive' } },
      ]
    },
    include: { course: true }
  })
  
  console.log(`Found ${modules.length} matching modules:`)
  modules.forEach(m => {
    console.log(`  - [${m.id}] "${m.title}" (course: ${m.course?.title || 'N/A'}) — current pdfUrl: ${m.pdfUrl || 'NULL'}`)
  })
  
  // Map: keyword → PDF file path (relative to /upload/)
  const pdfMap = [
    { keywords: ['mini bar', 'minibar'], pdfUrl: '/upload/Mini Bar.pdf', label: 'Mini Bar.pdf' },
    { keywords: ['safe box', 'safebox', 'safe lock'], pdfUrl: '/upload/Safe Box.pdf', label: 'Safe Box.pdf' },
    { keywords: ['kettle'], pdfUrl: '/upload/Electric Kettle Trainig PPT_11zon.pdf', label: 'Electric Kettle Trainig PPT_11zon.pdf' },
  ]
  
  let updated = 0
  for (const m of modules) {
    const lowerTitle = m.title.toLowerCase()
    const match = pdfMap.find(entry => entry.keywords.some(kw => lowerTitle.includes(kw)))
    if (match) {
      // Update pdfUrl
      await prisma.module.update({
        where: { id: m.id },
        data: { pdfUrl: match.pdfUrl }
      })
      console.log(`✓ Updated "${m.title}" → pdfUrl = ${match.pdfUrl}`)
      updated++
    } else {
      console.log(`  (no PDF match for "${m.title}")`)
    }
  }
  
  console.log(`\nDone. Updated ${updated} modules with PDF URLs.`)
  
  // Verify
  const verify = await prisma.module.findMany({
    where: { pdfUrl: { not: null } },
    select: { id: true, title: true, pdfUrl: true }
  })
  console.log(`\nVerification — modules with pdfUrl set:`)
  verify.forEach(m => console.log(`  - "${m.title}" → ${m.pdfUrl}`))
}

main()
  .catch(e => { console.error('Error:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
