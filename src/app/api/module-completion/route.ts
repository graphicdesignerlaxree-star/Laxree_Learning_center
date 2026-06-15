import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const courseId = searchParams.get('courseId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Get module completions for the user
    const where: any = { userId }
    if (courseId) {
      const modules = await db.module.findMany({
        where: { courseId },
        select: { id: true }
      })
      where.moduleId = { in: modules.map((m: any) => m.id) }
    }

    const completions = await db.moduleCompletion.findMany({
      where,
      include: {
        module: {
          select: {
            id: true,
            title: true,
            order: true,
            contentType: true,
            course: { select: { id: true, title: true, moduleType: true } },
          }
        }
      },
      orderBy: { completedAt: 'desc' },
    })

    // Get all module quiz attempts for admin view
    const assessmentAttempts = await db.assessmentAttempt.findMany({
      where: { userId },
      include: {
        assessment: { select: { title: true } },
      },
      orderBy: { completedAt: 'desc' },
    })

    return NextResponse.json({
      completions: completions.map(c => ({
        id: c.id,
        moduleId: c.moduleId,
        moduleTitle: c.module.title,
        moduleOrder: c.module.order,
        contentType: c.module.contentType,
        courseId: c.module.course.id,
        courseTitle: c.module.course.title,
        courseType: c.module.course.moduleType,
        completed: c.completed,
        score: c.score,
        timeSpent: c.timeSpent,
        completedAt: c.completedAt,
      })),
      quizAttempts: assessmentAttempts.map(a => ({
        id: a.id,
        assessmentTitle: a.assessment.title,
        score: a.percentage,
        passed: a.passed,
        correctAnswers: a.correctAnswers,
        totalQuestions: a.totalMarks,
        completedAt: a.completedAt,
      })),
    })
  } catch (error: any) {
    console.error('Module completion error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { userId, moduleId, completed, timeSpent } = data

    if (!userId || !moduleId) {
      return NextResponse.json({ error: 'userId and moduleId are required' }, { status: 400 })
    }

    const completion = await db.moduleCompletion.upsert({
      where: { userId_moduleId: { userId, moduleId } },
      update: {
        completed: completed ?? true,
        timeSpent: timeSpent ?? undefined,
        completedAt: completed !== false ? new Date() : null,
      },
      create: {
        userId,
        moduleId,
        completed: completed ?? true,
        timeSpent: timeSpent ?? null,
        completedAt: completed !== false ? new Date() : null,
      }
    })

    // Create activity
    const mod = await db.module.findUnique({ where: { id: moduleId } })
    if (mod) {
      await db.activity.create({
        data: {
          userId,
          type: 'module_complete',
          description: `Completed module: ${mod.title}`,
          metadata: JSON.stringify({ moduleId, completed }),
        }
      })

      // Update enrollment progress
      const enrollment = await db.enrollment.findFirst({
        where: { userId, courseId: mod.courseId }
      })
      if (enrollment) {
        const courseModules = await db.module.findMany({
          where: { courseId: mod.courseId },
          select: { id: true }
        })
        const completedCount = await db.moduleCompletion.count({
          where: {
            userId,
            moduleId: { in: courseModules.map(m => m.id) },
            completed: true,
          }
        })
        const progress = Math.round((completedCount / courseModules.length) * 100)
        const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'enrolled'

        await db.enrollment.update({
          where: { id: enrollment.id },
          data: {
            progress,
            status,
            completedAt: status === 'completed' ? new Date() : undefined,
          }
        })
      }
    }

    return NextResponse.json({ completion })
  } catch (error: any) {
    console.error('Module completion POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
