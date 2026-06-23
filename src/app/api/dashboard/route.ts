import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role are required' }, { status: 400 })
    }

    if (role === 'SUPER_ADMIN') {
      // Resolve admin's company so Amenities and Roofing data stay isolated
      const adminUser = await db.user.findUnique({ where: { id: userId }, select: { company: true } })
      const company = adminUser?.company
      const [
        totalEmployees, activeEmployees, newJoiners, departments,
        courses, assessments, certifications, pendingCertifications,
        recentActivities, topPerformers, deptStats
      ] = await Promise.all([
        db.user.count({ where: { role: 'EMPLOYEE', company } }),
        db.user.count({ where: { role: 'EMPLOYEE', isActive: true, company } }),
        db.user.count({ where: { role: 'EMPLOYEE', joiningDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, company } }),
        db.department.findMany({ where: { company }, include: { _count: { select: { users: true } } } }),
        db.course.count({ where: { company } }),
        db.assessment.count({ where: { company } }),
        db.certification.count({ where: { company } }),
        db.certificationAttempt.count({ where: { status: 'pending', certification: { company } } }),
        db.activity.findMany({ where: { user: { company } }, take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { fullName: true, email: true } } } }),
        db.user.findMany({ where: { role: 'EMPLOYEE', company }, orderBy: { aiReadinessScore: 'desc' }, take: 5, select: { id: true, fullName: true, aiReadinessScore: true, designation: true } }),
        db.department.findMany({ where: { company }, include: { users: { where: { role: 'EMPLOYEE' }, select: { aiReadinessScore: true } } } }),
      ])

      const avgReadiness = topPerformers.length > 0 ? Math.round(topPerformers.reduce((a: number, b: any) => a + b.aiReadinessScore, 0) / topPerformers.length) : 0

      // Calculate training completion
      const enrollments = await db.enrollment.findMany({ where: { status: 'completed', course: { company } } })
      const totalEnrollments = await db.enrollment.count({ where: { course: { company } } })
      const trainingCompletion = totalEnrollments > 0 ? Math.round((enrollments.length / totalEnrollments) * 100) : 0

      // Assessment scores
      const assessmentAttempts = await db.assessmentAttempt.findMany({ where: { assessment: { company } } })
      const avgAssessmentScore = assessmentAttempts.length > 0 ? Math.round(assessmentAttempts.reduce((a: number, b: any) => a + b.percentage, 0) / assessmentAttempts.length) : 0

      // Certification rate
      const certifiedAttempts = await db.certificationAttempt.count({ where: { status: 'approved', certification: { company } } })
      const totalCertAttempts = await db.certificationAttempt.count({ where: { certification: { company } } })
      const certRate = totalCertAttempts > 0 ? Math.round((certifiedAttempts / totalCertAttempts) * 100) : 0

      // Field and Inbound ready counts
      const fieldReadyCount = await db.user.count({ where: { role: 'EMPLOYEE', fieldReady: true, company } })
      const inboundReadyCount = await db.user.count({ where: { role: 'EMPLOYEE', inboundReady: true, company } })

      // Low performers
      const lowPerformers = await db.user.findMany({ where: { role: 'EMPLOYEE', company }, orderBy: { aiReadinessScore: 'asc' }, take: 5, select: { id: true, fullName: true, aiReadinessScore: true, designation: true } })

      // Mock simulation scores
      const mockAttempts = await db.mockSimulationAttempt.findMany({ where: { user: { company } } })
      const avgMockScore = mockAttempts.length > 0 ? Math.round(mockAttempts.reduce((a: number, b: any) => a + b.score, 0) / mockAttempts.length) : 0

      // Pending approvals
      const pendingApprovals = await db.certificationAttempt.count({ where: { status: 'pending', certification: { company } } })

      const response = NextResponse.json({
        totalEmployees, activeEmployees, newJoiners,
        trainingCompletion, certificationRate: certRate,
        avgAssessmentScore, avgMockScore,
        fieldReadyCount, inboundReadyCount,
        pendingApprovals, pendingCertifications,
        departments: deptStats.map((d: any) => ({
          id: d.id, name: d.name, employees: d.users ? d.users.length : 0,
          avgScore: d.users && d.users.length > 0 ? Math.round(d.users.reduce((a: number, b: any) => a + b.aiReadinessScore, 0) / d.users.length) : 0
        })),
        topPerformers, lowPerformers,
        recentActivities, avgReadiness,
        courses: courses, assessments, certifications,
        totalDocuments: await db.document.count(),
        totalQuestionBanks: await db.questionBank.count({ where: { company } }),
      })
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      return response
    }

    if (role === 'TRAINING_MANAGER') {
      const tmUser = await db.user.findUnique({ where: { id: userId }, select: { company: true } })
      const company = tmUser?.company
      const [totalEmployees, activeEmployees, courses, assessments, certifications] = await Promise.all([
        db.user.count({ where: { role: 'EMPLOYEE', company } }),
        db.user.count({ where: { role: 'EMPLOYEE', isActive: true, company } }),
        db.course.findMany({ where: { company }, include: { _count: { select: { enrollments: true, modules: true } } } }),
        db.assessment.findMany({ where: { company }, include: { _count: { select: { attempts: true } } } }),
        db.certification.findMany({ where: { company } }),
      ])

      const enrollments = await db.enrollment.findMany({ where: { course: { company } } })
      const completedEnrollments = enrollments.filter(e => e.status === 'completed').length
      const trainingCompletion = enrollments.length > 0 ? Math.round((completedEnrollments / enrollments.length) * 100) : 0

      const pendingCerts = await db.certificationAttempt.count({ where: { status: 'pending', certification: { company } } })
      const recentActivities = await db.activity.findMany({ where: { user: { company } }, take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { fullName: true } } } })

      return NextResponse.json({
        totalEmployees, activeEmployees, trainingCompletion,
        pendingCerts, courses, assessments, certifications, recentActivities,
      })
    }

    if (role === 'TEAM_LEADER') {
      const user = await db.user.findUnique({ where: { id: userId } })
      const company = user?.company
      const teamMembers = await db.user.findMany({
        where: { reportingManagerId: userId, role: 'EMPLOYEE', company },
        include: {
          department: { select: { name: true } },
          enrollments: true,
          assessmentAttempts: true,
          certificationAttempts: true,
        }
      })

      const fieldReady = teamMembers.filter(m => m.fieldReady).length
      const inboundReady = teamMembers.filter(m => m.inboundReady).length
      const pendingCerts = teamMembers.reduce((a, m) => a + m.certificationAttempts.filter(c => c.status === 'pending').length, 0)

      return NextResponse.json({
        teamMembers: teamMembers.map(m => ({
          id: m.id, fullName: m.fullName, designation: m.designation,
          department: m.department?.name, aiReadinessScore: m.aiReadinessScore,
          currentLevel: m.currentLevel, fieldReady: m.fieldReady, inboundReady: m.inboundReady,
          enrollmentCount: m.enrollments.length, assessmentCount: m.assessmentAttempts.length,
        })),
        totalTeam: teamMembers.length, fieldReady, inboundReady, pendingCerts,
      })
    }

    if (role === 'EMPLOYEE') {
      // Use lightweight separate queries to reduce memory footprint
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true, fullName: true, email: true, designation: true,
          departmentId: true, profilePhoto: true, aiReadinessScore: true,
          currentLevel: true, fieldReady: true, inboundReady: true,
          employeeId: true, isFirstLogin: true, location: true, mobileNumber: true,
          joiningDate: true, experienceLevel: true, previousIndustryExp: true,
          salesExperience: true, technicalExperience: true, preferredLanguage: true,
          leaderboardPosition: true, company: true,
          department: { select: { name: true } },
        }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Fetch related data sequentially to reduce memory footprint
      const enrollments = await db.enrollment.findMany({ where: { userId }, select: { id: true, progress: true, status: true, course: { select: { title: true } } } })
      const assessmentAttempts = await db.assessmentAttempt.findMany({ where: { userId }, select: { id: true, percentage: true, passed: true, completedAt: true, assessment: { select: { title: true } } } })
      const certificationAttempts = await db.certificationAttempt.findMany({ where: { userId }, select: { id: true, status: true, score: true, attemptedAt: true, certification: { select: { name: true } } } })
      const scorecards = await db.scorecard.findMany({ where: { userId }, select: { id: true, examName: true, scorePercentage: true, passStatus: true, date: true } })
      const mockSimulations = await db.mockSimulationAttempt.findMany({ where: { userId }, select: { id: true, score: true, communicationScore: true, technicalScore: true, productKnowledgeScore: true, salesScore: true, feedback: true, aiFeedback: true, completedAt: true } })
      const activities = await db.activity.findMany({ where: { userId }, take: 10, orderBy: { createdAt: 'desc' }, select: { id: true, type: true, description: true, createdAt: true } })
      const userBadges = await db.userBadge.findMany({ where: { userId }, include: { badge: true } })
      const notifications = await db.notification.findMany({ where: { userId, isRead: false }, take: 5 })
      const improvementPlans = await db.improvementPlan.findMany({ where: { employeeId: userId, status: { in: ['assigned', 'in_progress'] } } })

      const completedEnrollments = enrollments.filter(e => e.status === 'completed').length
      const totalEnrollments = enrollments.length
      const trainingCompletion = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0

      return NextResponse.json({
        user: {
          id: user.id, fullName: user.fullName, email: user.email, designation: user.designation,
          department: user.department?.name, profilePhoto: user.profilePhoto,
          aiReadinessScore: user.aiReadinessScore, currentLevel: user.currentLevel,
          fieldReady: user.fieldReady, inboundReady: user.inboundReady,
          employeeId: user.employeeId, isFirstLogin: user.isFirstLogin,
          location: user.location, mobileNumber: user.mobileNumber,
          joiningDate: user.joiningDate, experienceLevel: user.experienceLevel,
          previousIndustryExp: user.previousIndustryExp, salesExperience: user.salesExperience,
          technicalExperience: user.technicalExperience, preferredLanguage: user.preferredLanguage,
          company: user.company,
        },
        trainingCompletion,
        enrollments: enrollments.map(e => ({
          id: e.id, courseTitle: e.course.title, progress: e.progress, status: e.status,
        })),
        assessments: assessmentAttempts.map(a => ({
          id: a.id, title: a.assessment.title, score: a.percentage, passed: a.passed, date: a.completedAt,
        })),
        certifications: certificationAttempts.map(c => ({
          id: c.id, name: c.certification.name, status: c.status, score: c.score, date: c.attemptedAt,
        })),
        scorecards,
        mockSimulations,
        activities,
        badges: userBadges.map(b => b.badge),
        notifications,
        improvementPlans,
        leaderboardPosition: user.leaderboardPosition,
      })
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  } catch (error: any) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
