import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const department = searchParams.get('department') || ''
    const readiness = searchParams.get('readiness') || ''

    // Build where clause
    const where: any = { role: 'EMPLOYEE', isActive: true }

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { employeeId: { contains: search } },
      ]
    }

    if (department) {
      where.department = { name: department }
    }

    if (readiness) {
      if (readiness === 'field_ready') {
        where.fieldReady = true
      } else if (readiness === 'inbound_ready') {
        where.inboundReady = true
      } else if (readiness === 'not_ready') {
        where.fieldReady = false
        where.inboundReady = false
      } else if (readiness === 'high') {
        where.aiReadinessScore = { gte: 70 }
      } else if (readiness === 'medium') {
        where.aiReadinessScore = { gte: 40, lt: 70 }
      } else if (readiness === 'low') {
        where.aiReadinessScore = { lt: 40 }
      }
    }

    const employees = await db.user.findMany({
      where,
      include: {
        department: { select: { name: true } },
        enrollments: {
          include: {
            course: { select: { title: true, moduleType: true } },
          },
        },
        assessmentAttempts: {
          orderBy: { completedAt: 'desc' },
          take: 20,
        },
        moduleCompletions: true,
        mockSimulations: {
          orderBy: { completedAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { aiReadinessScore: 'desc' },
    })

    // Get all departments for filter
    const departments = await db.department.findMany({
      select: { name: true },
      orderBy: { name: 'asc' },
    })

    // Calculate performance data for each employee
    const performanceData = employees.map((emp) => {
      // Training progress: average of enrollment progress
      const totalEnrollments = emp.enrollments.length
      const trainingProgress = totalEnrollments > 0
        ? Math.round(emp.enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments)
        : 0

      // Quiz scores: average of all assessment attempts
      const quizAttempts = emp.assessmentAttempts.filter(a => a.completedAt !== null)
      const avgQuizScore = quizAttempts.length > 0
        ? Math.round(quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length)
        : 0

      // Simulation scores: average of all simulation attempts
      const simAttempts = emp.mockSimulations
      const avgSimScore = simAttempts.length > 0
        ? Math.round(simAttempts.reduce((sum, s) => sum + s.score, 0) / simAttempts.length)
        : 0

      // Communication vs Technical breakdown
      const avgCommunication = simAttempts.length > 0
        ? Math.round(simAttempts.reduce((sum, s) => sum + s.communicationScore, 0) / simAttempts.length)
        : 0
      const avgTechnical = simAttempts.length > 0
        ? Math.round(simAttempts.reduce((sum, s) => sum + s.technicalScore, 0) / simAttempts.length)
        : 0
      const avgProductKnowledge = simAttempts.length > 0
        ? Math.round(simAttempts.reduce((sum, s) => sum + s.productKnowledgeScore, 0) / simAttempts.length)
        : 0
      const avgSales = simAttempts.length > 0
        ? Math.round(simAttempts.reduce((sum, s) => sum + s.salesScore, 0) / simAttempts.length)
        : 0

      // Module completion rate
      const totalModules = emp.moduleCompletions.length
      const completedModules = emp.moduleCompletions.filter(m => m.completed).length
      const moduleCompletionRate = totalModules > 0
        ? Math.round((completedModules / totalModules) * 100)
        : 0

      // Last active
      const lastActivity = emp.lastLoginAt || emp.updatedAt

      return {
        id: emp.id,
        fullName: emp.fullName,
        email: emp.email,
        employeeId: emp.employeeId,
        designation: emp.designation,
        department: emp.department?.name || null,
        aiReadinessScore: Math.round(emp.aiReadinessScore),
        currentLevel: emp.currentLevel || 'Beginner',
        fieldReady: emp.fieldReady,
        inboundReady: emp.inboundReady,
        trainingProgress,
        avgQuizScore,
        avgSimScore,
        avgCommunication,
        avgTechnical,
        avgProductKnowledge,
        avgSales,
        moduleCompletionRate,
        totalEnrollments,
        completedModules,
        totalModules: emp.moduleCompletions.length,
        lastActive: lastActivity?.toISOString() || null,
        // Detailed breakdown
        enrollments: emp.enrollments.map(e => ({
          courseTitle: e.course.title,
          moduleType: e.course.moduleType,
          progress: e.progress,
          status: e.status,
        })),
        recentQuizAttempts: quizAttempts.slice(0, 5).map(a => ({
          id: a.id,
          score: a.percentage,
          passed: a.passed,
          totalMarks: a.totalMarks,
          completedAt: a.completedAt?.toISOString(),
        })),
        recentSimAttempts: simAttempts.slice(0, 5).map(s => ({
          id: s.id,
          score: s.score,
          communicationScore: s.communicationScore,
          technicalScore: s.technicalScore,
          productKnowledgeScore: s.productKnowledgeScore,
          salesScore: s.salesScore,
          completedAt: s.completedAt?.toISOString(),
        })),
      }
    })

    // Summary stats
    const summary = {
      totalEmployees: performanceData.length,
      avgReadiness: performanceData.length > 0
        ? Math.round(performanceData.reduce((s, e) => s + e.aiReadinessScore, 0) / performanceData.length)
        : 0,
      fieldReadyCount: performanceData.filter(e => e.fieldReady).length,
      inboundReadyCount: performanceData.filter(e => e.inboundReady).length,
      highReadiness: performanceData.filter(e => e.aiReadinessScore >= 70).length,
      mediumReadiness: performanceData.filter(e => e.aiReadinessScore >= 40 && e.aiReadinessScore < 70).length,
      lowReadiness: performanceData.filter(e => e.aiReadinessScore < 40).length,
      avgQuizScore: performanceData.length > 0
        ? Math.round(performanceData.reduce((s, e) => s + e.avgQuizScore, 0) / performanceData.length)
        : 0,
      avgSimScore: performanceData.length > 0
        ? Math.round(performanceData.reduce((s, e) => s + e.avgSimScore, 0) / performanceData.length)
        : 0,
    }

    return NextResponse.json({
      employees: performanceData,
      departments: departments.map(d => d.name),
      summary,
    })
  } catch (error: any) {
    console.error('Performance API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
