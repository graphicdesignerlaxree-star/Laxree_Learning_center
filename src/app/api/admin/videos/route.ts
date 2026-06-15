import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const category = searchParams.get('category')
    const productCategory = searchParams.get('productCategory')
    const isFeatured = searchParams.get('isFeatured')
    const isActive = searchParams.get('isActive')

    if (id) {
      const video = await db.video.findUnique({ where: { id } })
      if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })
      return NextResponse.json({ video })
    }

    const where: any = {}
    if (category) where.category = category
    if (productCategory) where.productCategory = productCategory
    if (isFeatured !== null && isFeatured !== undefined && isFeatured !== '') where.isFeatured = isFeatured === 'true'
    if (isActive !== null && isActive !== undefined && isActive !== '') where.isActive = isActive === 'true'

    const videos = await db.video.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ videos })
  } catch (error: any) {
    console.error('Videos GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { title, description, url, category, productCategory, duration, isFeatured, isActive, uploadedBy } = data

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 })
    }

    const video = await db.video.create({
      data: {
        title,
        description: description || null,
        url,
        category: category || null,
        productCategory: productCategory || null,
        duration: duration ? parseInt(String(duration)) : null,
        isFeatured: isFeatured ?? false,
        isActive: isActive ?? true,
        uploadedBy: uploadedBy || null,
      },
    })

    return NextResponse.json({ video }, { status: 201 })
  } catch (error: any) {
    console.error('Videos POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    const existing = await db.video.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const cleanData: any = {}
    if (updateData.title !== undefined) cleanData.title = updateData.title
    if (updateData.description !== undefined) cleanData.description = updateData.description || null
    if (updateData.url !== undefined) cleanData.url = updateData.url
    if (updateData.category !== undefined) cleanData.category = updateData.category || null
    if (updateData.productCategory !== undefined) cleanData.productCategory = updateData.productCategory || null
    if (updateData.duration !== undefined) cleanData.duration = updateData.duration ? parseInt(String(updateData.duration)) : null
    if (updateData.isFeatured !== undefined) cleanData.isFeatured = updateData.isFeatured
    if (updateData.isActive !== undefined) cleanData.isActive = updateData.isActive
    if (updateData.views !== undefined) cleanData.views = updateData.views

    const video = await db.video.update({
      where: { id },
      data: cleanData,
    })

    return NextResponse.json({ video })
  } catch (error: any) {
    console.error('Videos PUT error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    const existing = await db.video.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    await db.video.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Videos DELETE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
