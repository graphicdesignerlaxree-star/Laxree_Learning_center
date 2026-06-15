import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Valid Prisma User model fields that can be updated
const VALID_USER_FIELDS = [
  'email', 'password', 'role', 'fullName', 'employeeId', 'designation',
  'departmentId', 'location', 'reportingManagerId', 'joiningDate',
  'mobileNumber', 'profilePhoto', 'experienceLevel', 'previousIndustryExp',
  'salesExperience', 'technicalExperience', 'preferredLanguage',
  'isActive', 'isFirstLogin', 'isSuspended',
  'aiReadinessScore', 'fieldReady', 'inboundReady', 'currentLevel',
  'leaderboardPosition', 'lastLoginAt',
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const departmentId = searchParams.get('departmentId')
    const search = searchParams.get('search')
    
    const where: any = {}
    if (role) where.role = role
    if (departmentId) where.departmentId = departmentId
    if (search) where.OR = [
      { fullName: { contains: search } },
      { email: { contains: search } },
      { employeeId: { contains: search } },
    ]

    const users = await db.user.findMany({
      where,
      include: {
        department: { select: { name: true } },
        _count: { select: { enrollments: true, assessmentAttempts: true, certificationAttempts: true } }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ users })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Handle department name to ID lookup
    let departmentId = data.departmentId || null
    if (!departmentId && data.department) {
      const dept = await db.department.findFirst({ where: { name: data.department } })
      if (dept) departmentId = dept.id
    }
    // Ensure empty strings are converted to null for optional foreign keys
    if (!departmentId) departmentId = null
    
    // Only include valid fields - convert empty strings to null for optional fields
    const userData: any = {
      email: data.email,
      password: data.password || 'emp123',
      role: data.role || 'EMPLOYEE',
      fullName: data.fullName,
      departmentId,
      designation: data.designation || null,
      employeeId: data.employeeId || null,
      reportingManagerId: data.reportingManagerId || null,
      mobileNumber: data.mobileNumber || null,
      location: data.location || null,
      isFirstLogin: true,
      isActive: true,
    }
    
    const user = await db.user.create({ data: userData })
    
    // Audit log
    await db.auditLog.create({ data: { userId: data.createdBy || user.id, action: 'CREATE_USER', targetType: 'user', targetId: user.id, details: `Created user ${user.email}` } })
    
    return NextResponse.json({ user })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, updatedBy, department, ...rawUpdateData } = data
    
    if (!id) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    
    // Filter to only valid Prisma User fields
    const updateData: any = {}
    for (const [key, value] of Object.entries(rawUpdateData)) {
      if (VALID_USER_FIELDS.includes(key)) {
        // For foreign key fields, empty string means null (clear the relation)
        if ((key === 'departmentId' || key === 'reportingManagerId') && (value === '' || value === null || value === undefined)) {
          updateData[key] = null
        } else if (value !== undefined && value !== null && value !== '') {
          updateData[key] = value
        }
      }
    }
    
    // Handle joiningDate - convert string to Date
    if (updateData.joiningDate && typeof updateData.joiningDate === 'string') {
      updateData.joiningDate = new Date(updateData.joiningDate)
    }
    
    // Handle department name to ID lookup
    if (department) {
      const dept = await db.department.findFirst({ where: { name: department } })
      if (dept) updateData.departmentId = dept.id
    }
    
    // Check employeeId uniqueness before update
    if (updateData.employeeId) {
      const existingUser = await db.user.findFirst({ 
        where: { 
          employeeId: updateData.employeeId,
          NOT: { id } // Exclude the current user
        } 
      })
      if (existingUser) {
        return NextResponse.json({ 
          error: `Employee ID "${updateData.employeeId}" is already assigned to another user. Please use a different Employee ID.` 
        }, { status: 409 })
      }
    }
    
    // Remove any undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key]
    })
    
    const user = await db.user.update({
      where: { id },
      data: updateData,
    })
    
    // Audit log - don't fail the request if audit log fails
    try {
      await db.auditLog.create({ data: { userId: updatedBy || id, action: 'UPDATE_USER', targetType: 'user', targetId: id, details: `Updated user ${user.email}` } })
    } catch {
      // Ignore audit log errors
    }
    
    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('User update error:', error)
    // Handle Prisma unique constraint errors with friendly message
    if (error.message && (error.message.includes('Unique constraint failed') || error.message.includes('unique'))) {
      return NextResponse.json({ 
        error: 'A unique constraint was violated. The Employee ID or Email may already be in use.' 
      }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const adminId = searchParams.get('adminId')
    
    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    
    // Check user exists
    const user = await db.user.findUnique({ where: { id } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    
    // Delete all related records in a transaction to avoid foreign key errors
    await db.$transaction(async (tx) => {
      // 1. Delete module completions
      await tx.moduleCompletion.deleteMany({ where: { userId: id } })
      
      // 2. Delete enrollments
      await tx.enrollment.deleteMany({ where: { userId: id } })
      
      // 3. Delete assessment attempts and their related scorecards
      const assessmentAttempts = await tx.assessmentAttempt.findMany({ where: { userId: id }, select: { id: true } })
      const assessmentAttemptIds = assessmentAttempts.map(a => a.id)
      if (assessmentAttemptIds.length > 0) {
        await tx.scorecard.deleteMany({ where: { assessmentAttemptId: { in: assessmentAttemptIds } } })
      }
      await tx.assessmentAttempt.deleteMany({ where: { userId: id } })
      
      // 4. Delete certification attempts and their related approval logs
      const certAttempts = await tx.certificationAttempt.findMany({ where: { userId: id }, select: { id: true } })
      const certAttemptIds = certAttempts.map(c => c.id)
      if (certAttemptIds.length > 0) {
        await tx.approvalLog.deleteMany({ where: { certificationAttemptId: { in: certAttemptIds } } })
      }
      await tx.certificationAttempt.deleteMany({ where: { userId: id } })
      
      // 5. Delete exam attempts and their related scorecards
      const examAttempts = await tx.examAttempt.findMany({ where: { userId: id }, select: { id: true } })
      const examAttemptIds = examAttempts.map(e => e.id)
      if (examAttemptIds.length > 0) {
        await tx.scorecard.deleteMany({ where: { examAttemptId: { in: examAttemptIds } } })
      }
      await tx.examAttempt.deleteMany({ where: { userId: id } })
      
      // 6. Delete mock simulation attempts
      await tx.mockSimulationAttempt.deleteMany({ where: { userId: id } })
      
      // 7. Delete improvement plans (both as employee and as assigner)
      await tx.improvementPlan.deleteMany({ where: { OR: [{ employeeId: id }, { assignedBy: id }] } })
      
      // 8. Delete activities
      await tx.activity.deleteMany({ where: { userId: id } })
      
      // 9. Delete audit logs
      await tx.auditLog.deleteMany({ where: { userId: id } })
      
      // 10. Delete login history
      await tx.loginHistory.deleteMany({ where: { userId: id } })
      
      // 11. Delete notifications
      await tx.notification.deleteMany({ where: { userId: id } })
      
      // 12. Delete user badges
      await tx.userBadge.deleteMany({ where: { userId: id } })
      
      // 13. Delete standalone scorecards (not linked to assessment or exam attempts)
      await tx.scorecard.deleteMany({ where: { userId: id } })
      
      // 14. Delete approval logs (as approver and as employee)
      await tx.approvalLog.deleteMany({ where: { OR: [{ approverId: id }, { employeeId: id }] } })
      
      // 15. If user is a department head, set headId to null
      await tx.department.updateMany({ where: { headId: id }, data: { headId: null } })
      
      // 16. If user has team members, set their reportingManagerId to null
      await tx.user.updateMany({ where: { reportingManagerId: id }, data: { reportingManagerId: null } })
      
      // 17. Finally, delete the user
      await tx.user.delete({ where: { id } })
      
      // 18. Create audit log for the deletion (using adminId as the actor)
      if (adminId) {
        try {
          await tx.auditLog.create({ data: { userId: adminId, action: 'DELETE_USER', targetType: 'user', targetId: id, details: `Deleted user ${user.email}` } })
        } catch {
          // Ignore audit log creation error after user deletion
        }
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('User deletion error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
