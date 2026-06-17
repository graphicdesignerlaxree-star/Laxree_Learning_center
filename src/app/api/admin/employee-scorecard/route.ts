import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/employee-scorecard
//   ?userId=xxx  -> returns full performance data for that employee
//   (no userId)  -> returns list of all employees for the selector
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // ---- Employee list for the selector ----
    if (!userId) {
      const employees = await db.user.findMany({
        where: { role: 'EMPLOYEE' },
        select: {
          id: true,
          fullName: true,
          email: true,
          employeeId: true,
          designation: true,
          department: { select: { name: true } },
          aiReadinessScore: true,
          currentLevel: true,
          fieldReady: true,
          inboundReady: true,
          isActive: true,
        },
        orderBy: [{ fullName: 'asc' }, { email: 'asc' }],
      })
      const response = NextResponse.json({ employees })
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      return response
    }

    // ---- Full performance data for selected employee ----
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true, fullName: true, email: true, employeeId: true,
        designation: true, location: true, mobileNumber: true,
        joiningDate: true, profilePhoto: true, preferredLanguage: true,
        experienceLevel: true, previousIndustryExp: true,
        salesExperience: true, technicalExperience: true,
        aiReadinessScore: true, currentLevel: true,
        fieldReady: true, inboundReady: true,
        leaderboardPosition: true, isActive: true,
        department: { select: { name: true } },
        reportingManager: { select: { fullName: true, email: true } },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Fetch all performance-related data in parallel
    const [
      scorecards, examAttempts, assessmentAttempts, mockAttempts,
      certAttempts, enrollments, activities, badges,
    ] = await Promise.all([
      db.scorecard.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        select: {
          id: true, examName: true, date: true, totalQuestions: true,
          correctAnswers: true, wrongAnswers: true, scorePercentage: true,
          passStatus: true, certificationStatus: true, rank: true,
          improvementSuggestions: true, managerFeedback: true, aiFeedback: true,
        },
      }),
      db.examAttempt.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        include: { exam: { select: { title: true, examType: true, stage: true, passingScore: true } } },
      }),
      db.assessmentAttempt.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        include: { assessment: { select: { title: true, passingScore: true } } },
        take: 20,
      }),
      db.mockSimulationAttempt.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        include: { simulation: { select: { title: true, type: true } } },
      }),
      db.certificationAttempt.findMany({
        where: { userId },
        orderBy: { attemptedAt: 'desc' },
        include: { certification: { select: { name: true, requiredScore: true } } },
      }),
      db.enrollment.findMany({
        where: { userId },
        include: { course: { select: { title: true, moduleType: true } } },
      }),
      db.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
      db.userBadge.findMany({
        where: { userId },
        include: { badge: true },
      }),
    ])

    // ---- Compute summary stats ----
    const totalExams = examAttempts.length
    const passedExams = examAttempts.filter(e => e.passed).length
    const examPassRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0
    const avgExamScore = totalExams > 0 ? Math.round(examAttempts.reduce((a, e) => a + e.percentage, 0) / totalExams) : 0

    const totalAssessments = assessmentAttempts.length
    const passedAssessments = assessmentAttempts.filter(a => a.passed).length
    const avgAssessmentScore = totalAssessments > 0 ? Math.round(assessmentAttempts.reduce((a, b) => a + b.percentage, 0) / totalAssessments) : 0

    const totalScorecards = scorecards.length
    const passedScorecards = scorecards.filter(s => s.passStatus).length
    const avgScorecardScore = totalScorecards > 0 ? Math.round(scorecards.reduce((a, s) => a + s.scorePercentage, 0) / totalScorecards) : 0

    const totalMocks = mockAttempts.length
    const avgMockScore = totalMocks > 0 ? Math.round(mockAttempts.reduce((a, m) => a + m.score, 0) / totalMocks) : 0

    const completedEnrollments = enrollments.filter(e => e.status === 'completed').length
    const trainingCompletion = enrollments.length > 0 ? Math.round((completedEnrollments / enrollments.length) * 100) : 0

    const totalCerts = certAttempts.length
    const approvedCerts = certAttempts.filter(c => c.status === 'approved').length

    // Performance trend (last 10 scorecards, oldest first for charting)
    const trend = scorecards.slice(0, 10).reverse().map(s => ({
      name: s.examName.length > 20 ? s.examName.slice(0, 20) + '...' : s.examName,
      score: Math.round(s.scorePercentage),
      passed: s.passStatus,
      date: s.date,
    }))

    const response = NextResponse.json({
      user,
      summary: {
        totalExams, passedExams, examPassRate, avgExamScore,
        totalAssessments, passedAssessments, avgAssessmentScore,
        totalScorecards, passedScorecards, avgScorecardScore,
        totalMocks, avgMockScore,
        totalEnrollments: enrollments.length, completedEnrollments, trainingCompletion,
        totalCerts, approvedCerts,
        badgesEarned: badges.length,
      },
      scorecards,
      examAttempts: examAttempts.map(e => ({
        id: e.id, title: e.exam.title, examType: e.examType, stage: e.stage,
        score: e.percentage, correct: e.correctAnswers, wrong: e.wrongAnswers,
        total: e.totalMarks, passed: e.passed, adminApproved: e.adminApproved,
        date: e.startedAt, completedAt: e.completedAt,
        passingScore: e.exam.passingScore,
      })),
      assessmentAttempts: assessmentAttempts.map(a => ({
        id: a.id, title: a.assessment.title, score: a.percentage,
        correct: a.correctAnswers, wrong: a.wrongAnswers, passed: a.passed,
        date: a.completedAt, passingScore: a.assessment.passingScore,
      })),
      mockAttempts: mockAttempts.map(m => ({
        id: m.id, title: m.simulation.title, type: m.simulation.type,
        score: m.score, communicationScore: m.communicationScore,
        technicalScore: m.technicalScore, productKnowledgeScore: m.productKnowledgeScore,
        salesScore: m.salesScore, feedback: m.feedback, aiFeedback: m.aiFeedback,
        date: m.completedAt,
      })),
      certifications: certAttempts.map(c => ({
        id: c.id, name: c.certification.name, status: c.status,
        score: c.score, requiredScore: c.certification.requiredScore,
        date: c.attemptedAt, issuedAt: c.issuedAt, expiresAt: c.expiresAt,
      })),
      enrollments: enrollments.map(e => ({
        id: e.id, title: e.course.title, moduleType: e.course.moduleType,
        progress: e.progress, status: e.status,
        enrolledAt: e.enrolledAt, completedAt: e.completedAt,
      })),
      activities,
      badges: badges.map(b => b.badge),
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    return response
  } catch (error: any) {
    console.error('Employee scorecard error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
