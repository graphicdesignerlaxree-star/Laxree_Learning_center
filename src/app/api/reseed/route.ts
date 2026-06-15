import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { seedDatabase } from '../seed/route'

// Helper: safely delete many, skip if model is undefined (stale Prisma client)
async function safeDeleteMany(model: any, label: string) {
  if (model) {
    await model.deleteMany()
    console.log(`[Reseed] Deleted ${label}`)
  } else {
    console.log(`[Reseed] Skipped ${label} (model not available)`)
  }
}

export async function POST() {
  try {
    console.log('[Reseed] Starting database reset...')

    // Delete all data in correct order (child tables first, respecting foreign keys)
    await safeDeleteMany(db.moduleCompletion, 'ModuleCompletion')
    await safeDeleteMany(db.enrollment, 'Enrollment')
    await safeDeleteMany(db.assessmentQuestion, 'AssessmentQuestion')
    await safeDeleteMany(db.scorecard, 'Scorecard')
    await safeDeleteMany(db.certificationAttempt, 'CertificationAttempt')
    await safeDeleteMany(db.approvalLog, 'ApprovalLog')
    await safeDeleteMany(db.improvementPlan, 'ImprovementPlan')
    await safeDeleteMany(db.activity, 'Activity')
    await safeDeleteMany(db.auditLog, 'AuditLog')
    await safeDeleteMany(db.loginHistory, 'LoginHistory')
    await safeDeleteMany(db.notification, 'Notification')
    await safeDeleteMany(db.userBadge, 'UserBadge')
    await safeDeleteMany(db.mockSimulationAttempt, 'MockSimulationAttempt')
    await safeDeleteMany(db.mockSimulation, 'MockSimulation')
    await safeDeleteMany(db.examAttempt, 'ExamAttempt')
    await safeDeleteMany(db.examQuestion, 'ExamQuestion')
    await safeDeleteMany(db.exam, 'Exam')
    await safeDeleteMany(db.questionBank, 'QuestionBank')
    await safeDeleteMany(db.assessmentAttempt, 'AssessmentAttempt')
    await safeDeleteMany(db.module, 'Module')
    await safeDeleteMany(db.course, 'Course')
    await safeDeleteMany(db.assessment, 'Assessment')
    await safeDeleteMany(db.certification, 'Certification')
    await safeDeleteMany(db.learningPath, 'LearningPath')
    await safeDeleteMany(db.badge, 'Badge')
    await safeDeleteMany(db.productCategory, 'ProductCategory')
    await safeDeleteMany(db.document, 'Document')
    await safeDeleteMany(db.platformSetting, 'PlatformSetting')
    await safeDeleteMany(db.user, 'User')
    await safeDeleteMany(db.department, 'Department')

    console.log('[Reseed] All data deleted. Starting reseed...')

    // Run the shared seeding logic
    const result = await seedDatabase()

    console.log('[Reseed] Database reseeded successfully!')
    return NextResponse.json({
      message: 'Database reseeded successfully',
      data: result,
    })
  } catch (error: any) {
    console.error('[Reseed] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
