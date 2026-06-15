import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/stage-approval - List pending/approved/rejected stage approval requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // pending, approved, rejected, all
    const examType = searchParams.get('examType') // filter by exam type

    const whereClause: any = {
      passStatus: true,
      stage: { gt: 0 },
    }

    if (examType) {
      whereClause.examType = examType
    }

    if (status && status !== 'all') {
      whereClause.approvalStatus = status
    } else if (!status || status === 'pending') {
      // Default: show pending approvals
      whereClause.approvalStatus = 'pending'
    }

    const scorecards = await db.scorecard.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            employeeId: true,
            designation: true,
            departmentId: true,
            department: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    // Get counts for each status
    const counts = {
      pending: await db.scorecard.count({
        where: { passStatus: true, stage: { gt: 0 }, approvalStatus: 'pending' },
      }),
      approved: await db.scorecard.count({
        where: { passStatus: true, stage: { gt: 0 }, approvalStatus: 'approved' },
      }),
      rejected: await db.scorecard.count({
        where: { passStatus: true, stage: { gt: 0 }, approvalStatus: 'rejected' },
      }),
    }

    const formatted = scorecards.map((sc) => ({
      id: sc.id,
      userId: sc.userId,
      userName: sc.user.fullName || sc.user.email,
      employeeId: sc.user.employeeId,
      designation: sc.user.designation,
      department: sc.user.department?.name,
      examType: sc.examType,
      stage: sc.stage,
      stageLabel: sc.stageLabel,
      scorePercentage: sc.scorePercentage,
      passStatus: sc.passStatus,
      date: sc.date,
      adminApproved: sc.adminApproved,
      approvalStatus: sc.approvalStatus,
      approvedBy: sc.approvedBy,
      approvedAt: sc.approvedAt,
      approvalComment: sc.approvalComment,
    }))

    return NextResponse.json({ approvals: formatted, counts })
  } catch (error: any) {
    console.error('Error in GET /api/admin/stage-approval:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/admin/stage-approval - Admin approves/rejects a stage progression
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { scorecardId, action, comment, adminId } = data

    if (!scorecardId || !action || !adminId) {
      return NextResponse.json(
        { error: 'scorecardId, action, and adminId are required' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Fetch the scorecard
    const scorecard = await db.scorecard.findUnique({
      where: { id: scorecardId },
    })

    if (!scorecard) {
      return NextResponse.json({ error: 'Scorecard not found' }, { status: 404 })
    }

    if (!scorecard.passStatus) {
      return NextResponse.json(
        { error: 'Cannot approve/reject a failed exam' },
        { status: 400 }
      )
    }

    if (scorecard.approvalStatus === 'approved' && action === 'approve') {
      return NextResponse.json(
        { error: 'This stage is already approved' },
        { status: 400 }
      )
    }

    // Update the scorecard
    const updated = await db.scorecard.update({
      where: { id: scorecardId },
      data: {
        adminApproved: action === 'approve',
        approvalStatus: action === 'approve' ? 'approved' : 'rejected',
        approvedBy: adminId,
        approvedAt: new Date(),
        approvalComment: comment || null,
        certificationStatus: action === 'approve' ? 'approved' : 'rejected',
      },
    })

    // Create an activity log for the employee
    await db.activity.create({
      data: {
        userId: scorecard.userId,
        type: action === 'approve' ? 'stage_approved' : 'stage_rejected',
        description: action === 'approve'
          ? `Your ${scorecard.stageLabel || `Stage ${scorecard.stage}`} (${scorecard.examType === 'inbound_sales_exam' ? 'Inbound' : 'Field'} Sales) has been approved! You can now proceed to the next stage.`
          : `Your ${scorecard.stageLabel || `Stage ${scorecard.stage}`} (${scorecard.examType === 'inbound_sales_exam' ? 'Inbound' : 'Field'} Sales) progression was not approved. Please retake the exam.`,
        metadata: JSON.stringify({
          scorecardId,
          examType: scorecard.examType,
          stage: scorecard.stage,
          action,
          comment: comment || null,
        }),
      },
    })

    // Create a notification for the employee
    await db.notification.create({
      data: {
        userId: scorecard.userId,
        title: action === 'approve' ? 'Stage Progression Approved!' : 'Stage Progression Not Approved',
        message: action === 'approve'
          ? `Your ${scorecard.stageLabel || `Stage ${scorecard.stage}`} has been approved by admin. You can now proceed to the next stage.`
          : `Your ${scorecard.stageLabel || `Stage ${scorecard.stage}`} progression was not approved. You may need to retake the exam.${comment ? ` Admin note: ${comment}` : ''}`,
        type: action === 'approve' ? 'success' : 'warning',
      },
    })

    // Create an audit log
    await db.auditLog.create({
      data: {
        userId: adminId,
        action: `stage_${action}`,
        targetType: 'scorecard',
        targetId: scorecardId,
        details: JSON.stringify({
          employeeId: scorecard.userId,
          examType: scorecard.examType,
          stage: scorecard.stage,
          score: scorecard.scorePercentage,
          comment: comment || null,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      scorecard: {
        id: updated.id,
        approvalStatus: updated.approvalStatus,
        adminApproved: updated.adminApproved,
        approvedBy: updated.approvedBy,
        approvedAt: updated.approvedAt,
        approvalComment: updated.approvalComment,
      },
    })
  } catch (error: any) {
    console.error('Error in POST /api/admin/stage-approval:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
