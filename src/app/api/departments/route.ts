import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const departments = await db.department.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ departments })
  } catch (error: any) {
    console.error('Departments fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
