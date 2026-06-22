import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    const where: any = {}
    if (search) {
      where.user = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { employeeId: { contains: search, mode: 'insensitive' } },
        ]
      }
    }

    const logs = await db.loginHistory.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            employeeId: true,
            role: true,
            department: { select: { name: true } },
            profilePhoto: true,
          }
        }
      },
      orderBy: { loginAt: 'desc' },
      take: Math.min(limit, 500),
    })

    // Compute summary stats
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [todayCount, weekCount, uniqueUsersToday, uniqueUsersWeek] = await Promise.all([
      db.loginHistory.count({ where: { loginAt: { gte: last24h } } }),
      db.loginHistory.count({ where: { loginAt: { gte: last7d } } }),
      db.loginHistory.findMany({
        where: { loginAt: { gte: last24h } },
        select: { userId: true },
        distinct: ['userId'],
      }),
      db.loginHistory.findMany({
        where: { loginAt: { gte: last7d } },
        select: { userId: true },
        distinct: ['userId'],
      }),
    ])

    const response = NextResponse.json({
      logs,
      summary: {
        todayLogins: todayCount,
        weekLogins: weekCount,
        uniqueUsersToday: uniqueUsersToday.length,
        uniqueUsersWeek: uniqueUsersWeek.length,
        total: logs.length,
      }
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error: any) {
    console.error('Login history API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
