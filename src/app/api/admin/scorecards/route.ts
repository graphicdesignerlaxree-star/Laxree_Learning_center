import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const passStatus = searchParams.get('passStatus')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const departmentId = searchParams.get('departmentId')
    const userId = searchParams.get('userId')
    const examName = searchParams.get('examName')

    // Scorecard model fields: userId, examName, date, totalQuestions, correctAnswers,
    // wrongAnswers, scorePercentage, rank, passStatus, certificationStatus, etc.
    // — NO examType / stage fields (those are on ExamAttempt, not Scorecard)
    const where: any = {}
    if (passStatus !== null && passStatus !== undefined && passStatus !== '') where.passStatus = passStatus === 'true'
    if (userId) where.userId = userId
    if (examName) where.examName = { contains: examName, mode: 'insensitive' }
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) where.date.gte = new Date(dateFrom)
      if (dateTo) where.date.lte = new Date(dateTo + 'T23:59:59')
    }

    if (departmentId) {
      where.user = { departmentId }
    }

    const scorecards = await db.scorecard.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            employeeId: true,
            designation: true,
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    // Compute stats
    const totalScorecards = scorecards.length
    const passedCount = scorecards.filter(s => s.passStatus).length
    const failedCount = totalScorecards - passedCount
    const passRate = totalScorecards > 0 ? Math.round((passedCount / totalScorecards) * 100) : 0
    const avgScore = totalScorecards > 0 ? Math.round(scorecards.reduce((sum, s) => sum + s.scorePercentage, 0) / totalScorecards) : 0

    // Score distribution
    const distribution = [
      { range: '0-20', count: scorecards.filter(s => s.scorePercentage <= 20).length },
      { range: '21-40', count: scorecards.filter(s => s.scorePercentage > 20 && s.scorePercentage <= 40).length },
      { range: '41-60', count: scorecards.filter(s => s.scorePercentage > 40 && s.scorePercentage <= 60).length },
      { range: '61-80', count: scorecards.filter(s => s.scorePercentage > 60 && s.scorePercentage <= 80).length },
      { range: '81-100', count: scorecards.filter(s => s.scorePercentage > 80).length },
    ]

    // Department-wise performance
    const deptMap: Record<string, { total: number; passed: number; avgScore: number; scores: number[] }> = {}
    for (const sc of scorecards) {
      const dept = sc.user?.department?.name || 'Unknown'
      if (!deptMap[dept]) deptMap[dept] = { total: 0, passed: 0, avgScore: 0, scores: [] }
      deptMap[dept].total++
      if (sc.passStatus) deptMap[dept].passed++
      deptMap[dept].scores.push(sc.scorePercentage)
    }
    const departmentPerformance = Object.entries(deptMap).map(([name, data]) => ({
      name,
      total: data.total,
      passed: data.passed,
      passRate: data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0,
      avgScore: data.scores.length > 0 ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : 0,
    }))

    const response = NextResponse.json({
      scorecards,
      stats: {
        total: totalScorecards,
        passed: passedCount,
        failed: failedCount,
        passRate,
        avgScore,
        distribution,
        departmentPerformance,
      },
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    return response
  } catch (error: any) {
    console.error('Scorecards GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { scorecardId, managerFeedback } = data

    if (!scorecardId) {
      return NextResponse.json({ error: 'Scorecard ID is required' }, { status: 400 })
    }

    const existing = await db.scorecard.findUnique({ where: { id: scorecardId } })
    if (!existing) {
      return NextResponse.json({ error: 'Scorecard not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (managerFeedback !== undefined) updateData.managerFeedback = managerFeedback

    const scorecard = await db.scorecard.update({
      where: { id: scorecardId },
      data: updateData,
    })

    return NextResponse.json({ scorecard })
  } catch (error: any) {
    console.error('Scorecards POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
