import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    const where: any = {}
    if (userId) where.userId = userId
    if (status) where.status = status

    const attempts = await db.certificationAttempt.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, designation: true, department: { select: { name: true } } } },
        certification: true,
        approvalLog: { include: { approver: { select: { fullName: true } } } },
      },
      orderBy: { attemptedAt: 'desc' },
    })

    return NextResponse.json({ attempts })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const attempt = await db.certificationAttempt.create({
      data: {
        userId: data.userId,
        certificationId: data.certificationId,
        status: 'pending',
        score: data.score || 0,
      }
    })
    return NextResponse.json({ attempt })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, action, approverId, comment } = data

    const statusMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected',
      retraining: 'needs_training',
      additional_mock: 'needs_sales_coaching',
      additional_product: 'needs_technical_coaching',
      review: 'needs_review',
    }

    const attempt = await db.certificationAttempt.update({
      where: { id },
      data: { status: statusMap[action] || action },
    })

    // Create approval log
    await db.approvalLog.create({
      data: {
        certificationAttemptId: id,
        approverId,
        employeeId: attempt.userId,
        action,
        comment,
      }
    })

    // If approved, update user readiness
    if (action === 'approve') {
      const cert = await db.certification.findUnique({ where: { id: attempt.certificationId } })
      if (cert?.moduleType === 'FIELD_SALES') {
        await db.user.update({ where: { id: attempt.userId }, data: { fieldReady: true } })
      } else if (cert?.moduleType === 'INBOUND_SALES') {
        await db.user.update({ where: { id: attempt.userId }, data: { inboundReady: true } })
      }
      attempt.issuedAt = new Date()
      await db.certificationAttempt.update({ where: { id }, data: { issuedAt: new Date() } })
    }

    // Audit log
    await db.auditLog.create({
      data: { userId: approverId, action: `CERTIFICATION_${action.toUpperCase()}`, targetType: 'certification', targetId: id, details: comment }
    })

    return NextResponse.json({ attempt })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
