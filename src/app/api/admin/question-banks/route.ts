import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const moduleType = searchParams.get('moduleType')
    const questionType = searchParams.get('questionType')
    const search = searchParams.get('search')

    if (id) {
      const question = await db.questionBank.findUnique({ where: { id } })
      if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })
      return NextResponse.json({ question })
    }

    // QuestionBank model fields: question, questionType, optionA-D, correctAnswer,
    // acceptableAnswers, explanation, category, difficulty, moduleType, createdAt
    // — NO examType / stage / productCategory
    const where: any = {}
    if (category) where.category = category
    if (difficulty) where.difficulty = difficulty
    if (moduleType) where.moduleType = moduleType
    if (questionType) where.questionType = questionType
    if (search) {
      where.question = { contains: search, mode: 'insensitive' }
    }

    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '25')
    const skip = (page - 1) * pageSize

    const [questions, total, filteredTotal, byCategory, byDifficulty, byModuleType, byQuestionType] = await Promise.all([
      db.questionBank.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          _count: { select: { assessmentQuestions: true, examQuestions: true } },
        },
      }),
      db.questionBank.count(),
      db.questionBank.count({ where }),
      db.questionBank.groupBy({ by: ['category'], _count: true, where: { category: { not: null } } }),
      db.questionBank.groupBy({ by: ['difficulty'], _count: true, where: { difficulty: { not: null } } }),
      db.questionBank.groupBy({ by: ['moduleType'], _count: true, where: { moduleType: { not: null } } }),
      db.questionBank.groupBy({ by: ['questionType'], _count: true }),
    ])

    // Build stats object from groupBy results
    const statsByCategory: Record<string, number> = {}
    for (const item of byCategory) {
      if (item.category) statsByCategory[item.category] = item._count
    }
    const statsByDifficulty: Record<string, number> = {}
    for (const item of byDifficulty) {
      if (item.difficulty) statsByDifficulty[item.difficulty] = item._count
    }
    const statsByModuleType: Record<string, number> = {}
    for (const item of byModuleType) {
      if (item.moduleType) statsByModuleType[item.moduleType] = item._count
    }
    const statsByQuestionType: Record<string, number> = {}
    for (const item of byQuestionType) {
      if (item.questionType) statsByQuestionType[item.questionType] = item._count
    }

    const response = NextResponse.json({
      questions,
      total,
      filteredTotal,
      page,
      pageSize,
      totalPages: Math.ceil(filteredTotal / pageSize),
      stats: {
        total,
        easy: statsByDifficulty['easy'] || 0,
        medium: statsByDifficulty['medium'] || 0,
        hard: statsByDifficulty['hard'] || 0,
        mcq: statsByQuestionType['MCQ'] || 0,
        shortAnswer: statsByQuestionType['SHORT_ANSWER'] || 0,
        byCategory: statsByCategory,
        byDifficulty: statsByDifficulty,
        byModuleType: statsByModuleType,
        byQuestionType: statsByQuestionType,
      },
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    return response
  } catch (error: any) {
    console.error('Question banks GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { question, optionA, optionB, optionC, optionD, correctAnswer, acceptableAnswers, explanation, category, difficulty, questionType, moduleType } = data

    if (!question || !optionA || !optionB || !correctAnswer) {
      return NextResponse.json({ error: 'Question, optionA, optionB, and correctAnswer are required' }, { status: 400 })
    }

    const q = await db.questionBank.create({
      data: {
        question,
        optionA,
        optionB,
        optionC: optionC || null,
        optionD: optionD || null,
        correctAnswer,
        acceptableAnswers: acceptableAnswers || null,
        explanation: explanation || null,
        category: category || null,
        difficulty: difficulty || 'medium',
        questionType: questionType || 'MCQ',
        moduleType: moduleType || null,
      },
    })

    return NextResponse.json({ question: q }, { status: 201 })
  } catch (error: any) {
    console.error('Question banks POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 })
    }

    const existing = await db.questionBank.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // Only allow fields that exist on the QuestionBank model
    const cleanData: any = {}
    const allowedFields = ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer', 'acceptableAnswers', 'explanation', 'category', 'difficulty', 'questionType', 'moduleType']
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        cleanData[field] = updateData[field] || null
      }
    }

    const q = await db.questionBank.update({
      where: { id },
      data: cleanData,
    })

    return NextResponse.json({ question: q })
  } catch (error: any) {
    console.error('Question banks PUT error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 })
    }

    const existing = await db.questionBank.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    await db.assessmentQuestion.deleteMany({ where: { questionBankId: id } })
    await db.examQuestion.deleteMany({ where: { questionBankId: id } })
    await db.questionBank.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Question banks DELETE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
