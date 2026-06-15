import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')
    const userId = searchParams.get('userId')

    if (!moduleId) {
      return NextResponse.json({ error: 'moduleId is required' }, { status: 400 })
    }

    // Find the module
    const moduleData = await db.module.findUnique({
      where: { id: moduleId },
      include: { course: true }
    })

    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Find assessment for this module (match by title containing module title)
    const assessment = await db.assessment.findFirst({
      where: {
        title: { contains: moduleData.title },
        isActive: true,
      },
      include: {
        questions: {
          include: { question: true },
          orderBy: { order: 'asc' },
        }
      }
    })

    if (!assessment) {
      return NextResponse.json({ 
        quiz: null, 
        message: 'No quiz available for this module yet' 
      })
    }

    // Get previous attempts by this user
    let previousAttempts: any[] = []
    if (userId) {
      previousAttempts = await db.assessmentAttempt.findMany({
        where: { userId, assessmentId: assessment.id },
        orderBy: { completedAt: 'desc' },
        take: 5,
      })
    }

    // Get module completion
    let moduleCompletion = null
    if (userId) {
      moduleCompletion = await db.moduleCompletion.findUnique({
        where: { userId_moduleId: { userId, moduleId } }
      })
    }

    return NextResponse.json({
      quiz: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        duration: assessment.duration,
        passingScore: assessment.passingScore,
        totalQuestions: assessment.questions.length,
        questions: assessment.questions.map(aq => ({
          id: aq.question.id,
          question: aq.question.question,
          optionA: aq.question.optionA,
          optionB: aq.question.optionB,
          optionC: aq.question.optionC,
          optionD: aq.question.optionD,
          explanation: aq.question.explanation,
          marks: aq.marks,
        })),
      },
      previousAttempts: previousAttempts.map(a => ({
        id: a.id,
        score: a.percentage,
        passed: a.passed,
        correctAnswers: a.correctAnswers,
        totalQuestions: a.totalMarks,
        completedAt: a.completedAt,
      })),
      moduleCompletion: moduleCompletion ? {
        completed: moduleCompletion.completed,
        score: moduleCompletion.score,
        completedAt: moduleCompletion.completedAt,
      } : null,
    })
  } catch (error: any) {
    console.error('Module quiz error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { userId, assessmentId, moduleId, answers } = data

    if (!userId || !assessmentId || !answers) {
      return NextResponse.json({ error: 'userId, assessmentId, and answers are required' }, { status: 400 })
    }

    // Get assessment with questions
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: {
          include: { question: true },
          orderBy: { order: 'asc' },
        }
      }
    })

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Calculate score
    let correctAnswers = 0
    const answerDetails: Array<{
      questionId: string
      question: string
      userAnswer: string
      correctAnswer: string
      isCorrect: boolean
      explanation: string
    }> = []

    for (let i = 0; i < assessment.questions.length; i++) {
      const aq = assessment.questions[i]
      const userAnswer = answers[i] || ''
      const isCorrect = userAnswer === aq.question.correctAnswer
      if (isCorrect) correctAnswers++

      answerDetails.push({
        questionId: aq.question.id,
        question: aq.question.question,
        userAnswer,
        correctAnswer: aq.question.correctAnswer,
        isCorrect,
        explanation: aq.question.explanation || '',
      })
    }

    const totalQuestions = assessment.questions.length
    const percentage = Math.round((correctAnswers / totalQuestions) * 100)
    const passed = percentage >= assessment.passingScore

    // Create attempt
    const attempt = await db.assessmentAttempt.create({
      data: {
        userId,
        assessmentId,
        score: percentage,
        totalMarks: totalQuestions,
        correctAnswers,
        wrongAnswers: totalQuestions - correctAnswers,
        percentage,
        passed,
        answers: JSON.stringify(answers),
        completedAt: new Date(),
      }
    })

    // Create scorecard
    await db.scorecard.create({
      data: {
        userId,
        assessmentAttemptId: attempt.id,
        examName: assessment.title,
        totalQuestions,
        correctAnswers,
        wrongAnswers: totalQuestions - correctAnswers,
        scorePercentage: percentage,
        passStatus: passed,
        certificationStatus: passed ? 'pending_approval' : 'failed',
        aiFeedback: passed
          ? `Great job! You scored ${percentage}% on ${assessment.title}. ${percentage >= 90 ? 'Excellent mastery of this module!' : 'Good understanding - keep learning to achieve even higher scores.'}`
          : `You scored ${percentage}% on ${assessment.title}. Review the module content and try again. Focus on: ${correctAnswers < Math.ceil(totalQuestions / 2) ? 'core concepts and fundamentals' : 'specific details and edge cases'}.`,
      }
    })

    // Update module completion
    if (moduleId) {
      await db.moduleCompletion.upsert({
        where: { userId_moduleId: { userId, moduleId } },
        update: {
          completed: passed,
          score: percentage,
          completedAt: passed ? new Date() : null,
        },
        create: {
          userId,
          moduleId,
          completed: passed,
          score: percentage,
          completedAt: passed ? new Date() : null,
        }
      })
    }

    // Create activity
    await db.activity.create({
      data: {
        userId,
        type: 'quiz_completed',
        description: `Completed quiz: ${assessment.title} - Score: ${percentage}%${passed ? ' ✅ Passed' : ' ❌ Needs retry'}`,
        metadata: JSON.stringify({ 
          score: percentage, 
          passed, 
          moduleId,
          assessmentId,
          correctAnswers,
          totalQuestions,
        }),
      }
    })

    // Update enrollment progress
    if (moduleId) {
      const mod = await db.module.findUnique({
        where: { id: moduleId },
        select: { courseId: true }
      })
      if (mod) {
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
    }

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        score: percentage,
        passed,
        correctAnswers,
        totalQuestions,
        wrongAnswers: totalQuestions - correctAnswers,
        answerDetails,
      }
    })
  } catch (error: any) {
    console.error('Module quiz submit error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
