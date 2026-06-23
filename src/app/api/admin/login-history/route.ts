import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    // Optional admin identity for company-scoped filtering. When omitted the
    // API falls back to unfiltered behavior so existing Amenities callers keep
    // working unchanged.
    const adminId = searchParams.get('adminId') || searchParams.get('userId') || searchParams.get('requesterId')
    const adminUser = adminId
      ? await db.user.findUnique({ where: { id: adminId }, select: { company: true } })
      : null
    const company = adminUser?.company

    const where: any = {}
    if (company) where.user = { company }
    if (search) {
      where.user = {
        ...(where.user || {}),
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

    const statsWhere = company ? { user: { company } } : {}
    const [todayCount, weekCount, uniqueUsersToday, uniqueUsersWeek] = await Promise.all([
      db.loginHistory.count({ where: { loginAt: { gte: last24h }, ...statsWhere } }),
      db.loginHistory.count({ where: { loginAt: { gte: last7d }, ...statsWhere } }),
      db.loginHistory.findMany({
        where: { loginAt: { gte: last24h }, ...statsWhere },
        select: { userId: true },
        distinct: ['userId'],
      }),
      db.loginHistory.findMany({
        where: { loginAt: { gte: last7d }, ...statsWhere },
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
