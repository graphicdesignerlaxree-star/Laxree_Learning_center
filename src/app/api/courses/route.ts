import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, courseId } = body

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'userId and courseId required' }, { status: 400 })
    }

    // Use upsert to avoid race condition on unique constraint
    const enrollment = await db.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {}, // no-op if exists
      create: {
        userId,
        courseId,
        progress: 0,
        status: 'in_progress',
      },
    })

    return NextResponse.json({ enrollment })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleType = searchParams.get('moduleType')
    const userId = searchParams.get('userId')
    
    const where: any = { isActive: true }
    if (moduleType) where.moduleType = moduleType

    if (!db.course) {
      return NextResponse.json({ courses: [] })
    }

    const courses = await db.course.findMany({
      where,
      include: {
        modules: { orderBy: { order: 'asc' } },
        _count: { select: { enrollments: true } },
        learningPath: { select: { name: true } },
      },
      orderBy: { order: 'asc' },
    })

    // If userId provided, auto-enroll in any missing courses, then include enrollment status
    let enrollments: any[] = []
    if (userId) {
      try {
        const existing = await db.enrollment.findMany({
          where: { userId },
          select: { courseId: true, progress: true, status: true },
        })
        const enrolledIds = new Set(existing.map(e => e.courseId))
        const unenrolledCourses = courses.filter(c => !enrolledIds.has(c.id))

        // Auto-enroll in any active courses not yet enrolled (sequential, with try-catch per item)
        for (const c of unenrolledCourses) {
          try {
            await db.enrollment.upsert({
              where: { userId_courseId: { userId, courseId: c.id } },
              update: {},
              create: { userId, courseId: c.id, progress: 0, status: 'in_progress' },
            })
          } catch (err) {
            console.error(`Auto-enroll failed for course ${c.id}:`, err)
          }
        }

        // Re-fetch enrollments after auto-enrolling
        if (unenrolledCourses.length > 0) {
          enrollments = await db.enrollment.findMany({
            where: { userId },
            select: { courseId: true, progress: true, status: true },
          })
        } else {
          enrollments = existing
        }
      } catch (enrollErr) {
        console.error('Enrollment processing error:', enrollErr)
        // Continue without enrollment data - courses are still returned
      }
    }

    const enrollmentMap = new Map(enrollments.map(e => [e.courseId, e]))

    return NextResponse.json({
      courses: courses.map(c => ({
        ...c,
        enrollment: enrollmentMap.get(c.id) || null,
      }))
    })
  } catch (error: any) {
    console.error('Courses GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
