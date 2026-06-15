import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    const where: any = {}
    if (category) where.category = category

    const settings = await db.platformSetting.findMany({ where })
    return NextResponse.json({ settings })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { key, value, updatedBy } = data

    const setting = await db.platformSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, category: data.category },
    })

    await db.auditLog.create({
      data: { userId: updatedBy || '', action: 'UPDATE_SETTING', targetType: 'setting', targetId: setting.id, details: `Updated ${key} to ${value}` }
    })

    return NextResponse.json({ setting })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
