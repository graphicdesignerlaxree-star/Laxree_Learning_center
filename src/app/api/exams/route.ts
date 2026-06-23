import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const examId = searchParams.get('examId')

    // Defensive check: if Prisma client doesn't have exam model, return empty
    if (!db.exam) {
      return NextResponse.json({ exams: [], userAttempts: [] })
    }

    // Resolve the requester's company from userId for company-scoped filtering
    let requesterCompany: any = undefined
    if (userId) {
      const requester = await db.user.findUnique({ where: { id: userId }, select: { company: true } })
      if (requester) requesterCompany = requester.company
    }

    // Get specific exam with questions
    if (examId) {
      const exam = await db.exam.findUnique({
        where: { id: examId },
        include: {
          questions: {
            include: { question: true },
            orderBy: { order: 'asc' },
          }
        }
      })
      if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })

      // Company isolation: if we know the requester's company, the exam must match it
      if (requesterCompany && exam.company !== requesterCompany) {
        return NextResponse.json({ error: 'Exam not available for your segment' }, { status: 403 })
      }

      // Get user's previous attempts for this exam
      let attempts: any[] = []
      if (userId && db.examAttempt) {
        attempts = await db.examAttempt.findMany({
          where: { userId, examId },
          orderBy: { completedAt: 'desc' },
        })
      }

      // Check if user can take this exam (time gate + admin approval)
      let canTake = true
      let reason = ''
      if (userId) {
        const stageOrder = ['PRE', 'MID', 'HARD', 'EXTRA_HARD'] as const
        const currentStageIdx = stageOrder.indexOf(exam.stage as any)

        if (currentStageIdx > 0) {
          const prevStage = stageOrder[currentStageIdx - 1]
          let prevAttempt: any = null
          if (db.examAttempt) {
            prevAttempt = await db.examAttempt.findFirst({
              where: {
                userId,
                examType: exam.examType,
                stage: prevStage as any,
                passed: true,
                adminApproved: true,
              },
              orderBy: { completedAt: 'desc' },
            })
          }

          if (!prevAttempt) {
            canTake = false
            reason = `You must pass and get admin approval for the ${prevStage} stage first.`
          } else {
            // Check time gate
            const daysSincePrev = Math.floor((Date.now() - new Date(prevAttempt.completedAt!).getTime()) / (1000 * 60 * 60 * 24))
            if (daysSincePrev < exam.timeGateDays) {
              canTake = false
              reason = `Wait ${exam.timeGateDays - daysSincePrev} more day(s) before attempting this stage.`
            }
          }
        }
      }

      return NextResponse.json({
        exam: {
          id: exam.id,
          examType: exam.examType,
          stage: exam.stage,
          title: exam.title,
          description: exam.description,
          duration: exam.duration,
          passingScore: exam.passingScore,
          totalQuestions: exam.questions.length,
          timeGateDays: exam.timeGateDays,
          canTake,
          reason,
          questions: exam.questions.map(eq => ({
            id: eq.question.id,
            question: eq.question.question,
            questionType: eq.question.questionType,
            optionA: eq.question.optionA,
            optionB: eq.question.optionB,
            optionC: eq.question.optionC,
            optionD: eq.question.optionD,
            correctAnswer: eq.question.questionType === 'MCQ' ? eq.question.correctAnswer : null,
            acceptableAnswers: eq.question.questionType === 'SHORT_ANSWER' ? eq.question.acceptableAnswers : null,
            explanation: eq.question.explanation,
            category: eq.question.category,
            difficulty: eq.question.difficulty,
            marks: eq.marks,
          })),
        },
        attempts: attempts.map(a => ({
          id: a.id,
          score: a.percentage,
          passed: a.passed,
          adminApproved: a.adminApproved,
          correctAnswers: a.correctAnswers,
          totalQuestions: a.totalMarks,
          completedAt: a.completedAt,
        })),
      })
    }

    // Get all exams grouped by type
    const exams = await db.exam.findMany({
      where: { isActive: true, ...(requesterCompany ? { company: requesterCompany } : {}) },
      include: { _count: { select: { questions: true, attempts: true } } },
      orderBy: [{ examType: 'asc' }, { stage: 'asc' }],
    })

    // Get user's attempts for all exams
    let userAttempts: any[] = []
    if (userId && db.examAttempt) {
      userAttempts = await db.examAttempt.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
      })
    }

    return NextResponse.json({ exams, userAttempts })
  } catch (error: any) {
    console.error('Exams GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { userId, examId, answers } = data

    if (!userId || !examId || !answers) {
      return NextResponse.json({ error: 'userId, examId, and answers are required' }, { status: 400 })
    }

    // Get exam with questions
    const exam = await db.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: { question: true },
          orderBy: { order: 'asc' },
        }
      }
    })

    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })

    // Grade the exam
    let correctAnswers = 0
    const answerDetails: Array<{
      questionId: string
      question: string
      questionType: string
      userAnswer: string
      correctAnswer: string
      acceptableAnswers: string[] | null
      isCorrect: boolean
      explanation: string
      autoGraded: boolean
    }> = []

    for (let i = 0; i < exam.questions.length; i++) {
      const eq = exam.questions[i]
      const userAnswer = (answers[i] || '').trim()
      const question = eq.question

      if (question.questionType === 'MCQ') {
        const isCorrect = userAnswer === question.correctAnswer
        if (isCorrect) correctAnswers++

        answerDetails.push({
          questionId: question.id,
          question: question.question,
          questionType: 'MCQ',
          userAnswer,
          correctAnswer: question.correctAnswer,
          acceptableAnswers: null,
          isCorrect,
          explanation: question.explanation || '',
          autoGraded: true,
        })
      } else {
        // SHORT_ANSWER - keyword matching
        const acceptableList: string[] = question.acceptableAnswers
          ? JSON.parse(question.acceptableAnswers)
          : [question.correctAnswer]

        const isCorrect = checkShortAnswer(userAnswer, acceptableList)
        if (isCorrect) correctAnswers++

        answerDetails.push({
          questionId: question.id,
          question: question.question,
          questionType: 'SHORT_ANSWER',
          userAnswer,
          correctAnswer: question.correctAnswer,
          acceptableAnswers: acceptableList,
          isCorrect,
          explanation: question.explanation || '',
          autoGraded: true,
        })
      }
    }

    const totalQuestions = exam.questions.length
    const percentage = Math.round((correctAnswers / totalQuestions) * 100)
    const passed = percentage >= exam.passingScore

    // Create attempt
    const attempt = await db.examAttempt.create({
      data: {
        userId,
        examId,
        examType: exam.examType,
        stage: exam.stage,
        score: percentage,
        totalMarks: totalQuestions,
        correctAnswers,
        wrongAnswers: totalQuestions - correctAnswers,
        percentage,
        passed,
        answers: JSON.stringify(answers),
        shortAnswerGrades: JSON.stringify(answerDetails.filter(a => a.questionType === 'SHORT_ANSWER')),
        completedAt: new Date(),
      }
    })

    // Create scorecard
    await db.scorecard.create({
      data: {
        userId,
        examAttemptId: attempt.id,
        examName: exam.title,
        totalQuestions,
        correctAnswers,
        wrongAnswers: totalQuestions - correctAnswers,
        scorePercentage: percentage,
        passStatus: passed,
        certificationStatus: passed ? 'pending_approval' : 'failed',
        improvementSuggestions: passed
          ? undefined
          : `Focus on improving your knowledge in the areas you missed. Review the relevant modules and try again.`,
        aiFeedback: passed
          ? `Great job! You scored ${percentage}% on ${exam.title}. ${percentage >= 90 ? 'Excellent mastery!' : 'Good understanding - keep pushing to the next level.'}`
          : `You scored ${percentage}% on ${exam.title}. Review the material and try again. ${correctAnswers < Math.ceil(totalQuestions / 2) ? 'Focus on core concepts and fundamentals.' : 'Work on specific details and advanced topics.'}`,
      }
    })

    // Create activity
    await db.activity.create({
      data: {
        userId,
        type: 'exam_completed',
        description: `Completed ${exam.title} - Score: ${percentage}%${passed ? ' ✅ Passed' : ' ❌ Needs retry'}`,
        metadata: JSON.stringify({
          score: percentage,
          passed,
          examType: exam.examType,
          stage: exam.stage,
          correctAnswers,
          totalQuestions,
        }),
      }
    })

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        score: percentage,
        passed,
        adminApproved: false,
        correctAnswers,
        totalQuestions,
        wrongAnswers: totalQuestions - correctAnswers,
        answerDetails,
      }
    })
  } catch (error: any) {
    console.error('Exam submit error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Short answer checking with keyword matching
function checkShortAnswer(userAnswer: string, acceptableAnswers: string[]): boolean {
  const normalized = userAnswer.toLowerCase().trim()
  if (!normalized) return false

  // Exact match
  if (acceptableAnswers.some(a => a.toLowerCase().trim() === normalized)) return true

  // Check if answer contains key terms from any acceptable answer
  for (const acceptable of acceptableAnswers) {
    const keywords = acceptable.toLowerCase().split(/[\s,;]+/).filter(w => w.length > 2)
    const matchCount = keywords.filter(kw => normalized.includes(kw)).length
    // If 60%+ of keywords are present, consider it correct
    if (keywords.length > 0 && matchCount / keywords.length >= 0.6) return true
  }

  return false
}
