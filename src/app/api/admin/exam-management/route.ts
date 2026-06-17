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
          },
          _count: { select: { attempts: true } },
        },
      })
      if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
      return NextResponse.json({ assessment })
    }

    // Assessment model fields: title, description, moduleType, duration, passingScore,
    // totalQuestions, isActive, createdAt, updatedAt — NO stage/examType/stageLabel
    const assessments = await db.assessment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { attempts: true, questions: true } },
      },
    })

    const attemptStats = await db.assessmentAttempt.groupBy({
      by: ['assessmentId'],
      _count: true,
      _avg: { percentage: true },
    })

    const passCounts = await db.assessmentAttempt.groupBy({
      by: ['assessmentId'],
      where: { passed: true },
      _count: true,
    })

    const statsMap: Record<string, { attempts: number; avgScore: number; passRate: number }> = {}
    for (const stat of attemptStats) {
      const passCount = passCounts.find(p => p.assessmentId === stat.assessmentId)?._count || 0
      statsMap[stat.assessmentId] = {
        attempts: stat._count,
        avgScore: Math.round(stat._avg.percentage || 0),
        passRate: stat._count > 0 ? Math.round((passCount / stat._count) * 100) : 0,
      }
    }

    const response = NextResponse.json({ assessments, statsMap })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    return response
  } catch (error: any) {
    console.error('Exam management GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { title, description, moduleType, duration, passingScore, isActive, questionIds } = data

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Only use fields that exist on the Assessment model
    const assessment = await db.assessment.create({
      data: {
        title,
        description: description || null,
        moduleType: moduleType || null,
        duration: duration ? parseInt(String(duration)) : null,
        passingScore: passingScore ? parseFloat(String(passingScore)) : 70,
        totalQuestions: questionIds ? questionIds.length : 0,
        isActive: isActive ?? true,
      },
    })

    if (questionIds && questionIds.length > 0) {
      await db.assessmentQuestion.createMany({
        data: questionIds.map((qId: string, index: number) => ({
          assessmentId: assessment.id,
          questionBankId: qId,
          order: index,
        })),
      })
    }

    return NextResponse.json({ assessment }, { status: 201 })
  } catch (error: any) {
    console.error('Exam management POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, questionIds, ...updateData } = data

    if (!id) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 })
    }

    const existing = await db.assessment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Only allow fields that exist on the Assessment model
    const cleanData: any = {}
    const allowedFields = ['title', 'description', 'moduleType', 'duration', 'passingScore', 'isActive']
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        cleanData[field] = updateData[field]
      }
    }

    if (questionIds !== undefined) {
      await db.assessmentQuestion.deleteMany({ where: { assessmentId: id } })
      if (questionIds.length > 0) {
        await db.assessmentQuestion.createMany({
          data: questionIds.map((qId: string, index: number) => ({
            assessmentId: id,
            questionBankId: qId,
            order: index,
          })),
        })
      }
      cleanData.totalQuestions = questionIds.length
    }

    const assessment = await db.assessment.update({
      where: { id },
      data: cleanData,
    })

    return NextResponse.json({ assessment })
  } catch (error: any) {
    console.error('Exam management PUT error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 })
    }

    const existing = await db.assessment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    await db.assessmentQuestion.deleteMany({ where: { assessmentId: id } })
    await db.assessmentAttempt.deleteMany({ where: { assessmentId: id } })
    await db.assessment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Exam management DELETE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
