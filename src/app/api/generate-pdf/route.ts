import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')
    const type = searchParams.get('type') // 'module' or 'catalog'

    if (type === 'catalog') {
      // Return catalog documents list
      const catalogs = await db.document.findMany({
        where: { type: { in: ['catalog', 'pdf', 'sop'] } },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ catalogs })
    }

    if (!moduleId) {
      return NextResponse.json({ error: 'moduleId is required' }, { status: 400 })
    }

    // Get module content for PDF generation
    const moduleData = await db.module.findUnique({
      where: { id: moduleId },
      include: {
        course: { select: { title: true, moduleType: true } },
        productCategory: { select: { name: true, icon: true } },
      }
    })

    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Return module data that can be used to generate a PDF client-side
    // We'll generate the PDF on the client side using the browser's print-to-PDF
    // or using a simple HTML-to-PDF approach
    return NextResponse.json({
      module: {
        id: moduleData.id,
        title: moduleData.title,
        description: moduleData.description,
        content: moduleData.content,
        contentType: moduleData.contentType,
        pdfUrl: moduleData.pdfUrl,
        courseTitle: moduleData.course.title,
        category: moduleData.productCategory?.name,
        categoryIcon: moduleData.productCategory?.icon,
        duration: moduleData.duration,
      }
    })
  } catch (error: any) {
    console.error('Generate PDF error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
