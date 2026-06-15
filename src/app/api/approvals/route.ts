import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const approverId = searchParams.get('approverId')
    const pending = searchParams.get('pending')
    
    let where: any = {}
    if (approverId) {
      // Get pending certifications for the approver's team members
      const teamMembers = await db.user.findMany({
        where: { reportingManagerId: approverId },
        select: { id: true }
      })
      const teamIds = teamMembers.map(m => m.id)
      
      if (pending === 'true') {
        where = {
          userId: { in: teamIds },
          status: 'pending',
        }
      } else {
        where = { userId: { in: teamIds } }
      }
    }

    const attempts = await db.certificationAttempt.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, designation: true, employeeId: true, department: { select: { name: true } } } },
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
    const { employeeId, approverId, action, comment, certificationAttemptId, type } = data

    // Create approval log
    await db.approvalLog.create({
      data: {
        certificationAttemptId,
        approverId,
        employeeId,
        action,
        comment,
      }
    })

    // Update certification attempt status
    if (certificationAttemptId) {
      const statusMap: Record<string, string> = {
        approve: 'approved',
        reject: 'rejected',
        retraining: 'needs_training',
        additional_mock: 'needs_sales_coaching',
        additional_product: 'needs_technical_coaching',
        review: 'needs_review',
      }
      
      await db.certificationAttempt.update({
        where: { id: certificationAttemptId },
        data: { status: statusMap[action] || action }
      })

      // If approved for field/inbound, update user
      if (action === 'approve') {
        const certAttempt = await db.certificationAttempt.findUnique({
          where: { id: certificationAttemptId },
          include: { certification: true }
        })
        if (certAttempt?.certification.moduleType === 'FIELD_SALES') {
          await db.user.update({ where: { id: employeeId }, data: { fieldReady: true } })
        } else if (certAttempt?.certification.moduleType === 'INBOUND_SALES') {
          await db.user.update({ where: { id: employeeId }, data: { inboundReady: true } })
        }
      }
    }

    // Create improvement plan if needed
    if (['retraining', 'additional_mock', 'additional_product'].includes(action)) {
      await db.improvementPlan.create({
        data: {
          employeeId,
          assignedBy: approverId,
          title: action === 'retraining' ? 'Retraining Required' : action === 'additional_mock' ? 'Additional Mock Practice' : 'Additional Product Learning',
          description: comment || `Manager requested ${action.replace('_', ' ')}`,
          type: action,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        }
      })
    }

    // Notify employee
    await db.notification.create({
      data: {
        userId: employeeId,
        title: action === 'approve' ? 'Certification Approved!' : 'Certification Update',
        message: action === 'approve' ? 'Your certification has been approved.' : `Your certification status has been updated: ${action}`,
        type: action === 'approve' ? 'success' : 'warning',
      }
    })

    // Audit log
    await db.auditLog.create({
      data: { userId: approverId, action: `APPROVAL_${action.toUpperCase()}`, targetType: 'certification', targetId: certificationAttemptId, details: comment }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
