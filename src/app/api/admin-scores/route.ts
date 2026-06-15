import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const viewType = searchParams.get('viewType') || 'module-scores'
    const departmentId = searchParams.get('departmentId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (viewType === 'module-scores') {
      // Get all employees with their module quiz scores
      const where: any = { role: 'EMPLOYEE', isActive: true }
      if (departmentId) where.departmentId = departmentId

      const employees = await db.user.findMany({
        where,
        include: {
          department: { select: { name: true } },
          moduleCompletions: {
            include: {
              module: {
                select: {
                  id: true,
                  title: true,
                  order: true,
                  course: { select: { title: true, moduleType: true } },
                }
              }
            },
            orderBy: { completedAt: 'desc' },
          },
          assessmentAttempts: {
            include: {
              assessment: { select: { title: true } },
            },
            orderBy: { completedAt: 'desc' },
          },
        },
        orderBy: { fullName: 'asc' },
      })

      // Get all modules for column headers
      const modules = await db.module.findMany({
        where: { course: { isActive: true } },
        include: { course: { select: { title: true, moduleType: true } } },
        orderBy: [{ course: { order: 'asc' } }, { order: 'asc' }],
      })

      // Filter by date if provided
      let filteredEmployees = employees
      if (dateFrom || dateTo) {
        filteredEmployees = employees.map(emp => ({
          ...emp,
          assessmentAttempts: emp.assessmentAttempts.filter(a => {
            const d = a.completedAt ? new Date(a.completedAt) : null
            if (!d) return false
            if (dateFrom && d < new Date(dateFrom)) return false
            if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false
            return true
          }),
        }))
      }

      return NextResponse.json({
        modules: modules.map(m => ({
          id: m.id,
          title: m.title,
          courseTitle: m.course.title,
          courseType: m.course.moduleType,
          order: m.order,
        })),
        employees: filteredEmployees.map(emp => ({
          id: emp.id,
          fullName: emp.fullName,
          email: emp.email,
          employeeId: emp.employeeId,
          designation: emp.designation,
          department: emp.department?.name,
          currentLevel: emp.currentLevel,
          aiReadinessScore: emp.aiReadinessScore,
          moduleScores: emp.moduleCompletions.map(mc => ({
            moduleId: mc.moduleId,
            moduleTitle: mc.module.title,
            completed: mc.completed,
            score: mc.score,
            completedAt: mc.completedAt,
          })),
          quizAttempts: emp.assessmentAttempts.map(a => ({
            id: a.id,
            assessmentTitle: a.assessment.title,
            score: a.percentage,
            passed: a.passed,
            completedAt: a.completedAt,
          })),
        })),
      })
    }

    if (viewType === 'simulation-scores') {
      // Get mock simulation scores for all employees
      const where: any = { role: 'EMPLOYEE', isActive: true }
      if (departmentId) where.departmentId = departmentId

      const employees = await db.user.findMany({
        where,
        include: {
          department: { select: { name: true } },
          mockSimulations: {
            include: {
              simulation: { select: { title: true, type: true } },
            },
            orderBy: { completedAt: 'desc' },
          },
        },
        orderBy: { fullName: 'asc' },
      })

      // Filter by date if provided
      let filteredEmployees = employees
      if (dateFrom || dateTo) {
        filteredEmployees = employees.map(emp => ({
          ...emp,
          mockSimulations: emp.mockSimulations.filter(s => {
            const d = new Date(s.completedAt)
            if (dateFrom && d < new Date(dateFrom)) return false
            if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false
            return true
          }),
        }))
      }

      // Get all simulations
      const simulations = await db.mockSimulation.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      })

      return NextResponse.json({
        simulations: simulations.map(s => ({
          id: s.id,
          title: s.title,
          type: s.type,
        })),
        employees: filteredEmployees.map(emp => ({
          id: emp.id,
          fullName: emp.fullName,
          email: emp.email,
          employeeId: emp.employeeId,
          designation: emp.designation,
          department: emp.department?.name,
          currentLevel: emp.currentLevel,
          simulationAttempts: emp.mockSimulations.map(s => ({
            id: s.id,
            simulationTitle: s.simulation.title,
            simulationType: s.simulation.type,
            score: s.score,
            communicationScore: s.communicationScore,
            technicalScore: s.technicalScore,
            productKnowledgeScore: s.productKnowledgeScore,
            salesScore: s.salesScore,
            feedback: s.feedback,
            aiFeedback: s.aiFeedback,
            completedAt: s.completedAt,
          })),
        })),
      })
    }

    if (viewType === 'daily-scores') {
      // Get today's scores grouped by employee
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todayAttempts = await db.assessmentAttempt.findMany({
        where: {
          completedAt: {
            gte: today,
            lt: tomorrow,
          }
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              employeeId: true,
              designation: true,
              department: { select: { name: true } },
            }
          },
          assessment: { select: { title: true } },
        },
        orderBy: { completedAt: 'desc' },
      })

      const todaySimulations = await db.mockSimulationAttempt.findMany({
        where: {
          completedAt: {
            gte: today,
            lt: tomorrow,
          }
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              employeeId: true,
              designation: true,
              department: { select: { name: true } },
            }
          },
          simulation: { select: { title: true, type: true } },
        },
        orderBy: { completedAt: 'desc' },
      })

      return NextResponse.json({
        date: today.toISOString(),
        quizAttempts: todayAttempts.map(a => ({
          id: a.id,
          employeeName: a.user.fullName,
          employeeId: a.user.employeeId,
          department: a.user.department?.name,
          assessmentTitle: a.assessment.title,
          score: a.percentage,
          passed: a.passed,
          completedAt: a.completedAt,
        })),
        simulationAttempts: todaySimulations.map(s => ({
          id: s.id,
          employeeName: s.user.fullName,
          employeeId: s.user.employeeId,
          department: s.user.department?.name,
          simulationTitle: s.simulation.title,
          simulationType: s.simulation.type,
          score: s.score,
          communicationScore: s.communicationScore,
          technicalScore: s.technicalScore,
          productKnowledgeScore: s.productKnowledgeScore,
          salesScore: s.salesScore,
          completedAt: s.completedAt,
        })),
      })
    }

    return NextResponse.json({ error: 'Invalid viewType' }, { status: 400 })
  } catch (error: any) {
    console.error('Admin scores error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
