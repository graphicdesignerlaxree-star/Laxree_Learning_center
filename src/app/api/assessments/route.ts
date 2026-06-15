import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (id) {
      const assessment = await db.assessment.findUnique({
        where: { id },
        include: {
          questions: {
            include: { question: true },
            orderBy: { order: 'asc' },
          }
        }
      })
      return NextResponse.json({ assessment })
    }

    const assessments = await db.assessment.findMany({
      where: { isActive: true },
      include: { _count: { select: { attempts: true } } },
    })
    return NextResponse.json({ assessments })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    // Submit assessment attempt
    const { userId, assessmentId, answers } = data
    
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: { include: { question: true }, orderBy: { order: 'asc' } } }
    })

    if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })

    let correctAnswers = 0
    for (let i = 0; i < assessment.questions.length; i++) {
      const q = assessment.questions[i]
      if (answers[i] === q.question.correctAnswer) correctAnswers++
    }

    const totalQuestions = assessment.questions.length
    const percentage = Math.round((correctAnswers / totalQuestions) * 100)
    const passed = percentage >= assessment.passingScore

    const attempt = await db.assessmentAttempt.create({
      data: {
        userId, assessmentId, score: percentage, totalMarks: 100,
        correctAnswers, wrongAnswers: totalQuestions - correctAnswers,
        percentage, passed, answers: JSON.stringify(answers), completedAt: new Date(),
      }
    })

    // Create scorecard
    await db.scorecard.create({
      data: {
        userId, assessmentAttemptId: attempt.id,
        examName: assessment.title,
        totalQuestions, correctAnswers, wrongAnswers: totalQuestions - correctAnswers,
        scorePercentage: percentage, passStatus: passed,
        certificationStatus: passed ? 'pending_approval' : 'failed',
        aiFeedback: passed
          ? `Good performance! You scored ${percentage}%. ${percentage >= 90 ? 'Excellent work - consider advanced certifications.' : 'Keep improving to reach the next level.'}`
          : `You scored ${percentage}%. Focus on reviewing the material and try again. Key areas to improve: ${correctAnswers < totalQuestions / 2 ? 'core concepts and product knowledge' : 'advanced topics and edge cases'}.`,
      }
    })

    // Create activity
    await db.activity.create({
      data: { userId, type: 'assessment_taken', description: `Completed ${assessment.title} - Score: ${percentage}%`, metadata: JSON.stringify({ score: percentage, passed }) }
    })

    return NextResponse.json({ attempt: { ...attempt, correctAnswers, totalQuestions, percentage, passed } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
