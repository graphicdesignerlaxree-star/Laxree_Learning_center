import { NextRequest, NextResponse } from 'next/server'
import { db, withDbRetry } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password, company } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Retry on Neon cold-start auth/connection failures
    const user = await withDbRetry(() =>
      db.user.findUnique({
        where: { email },
        include: {
          department: { select: { name: true } },
          headedDepartment: { select: { name: true } },
        }
      })
    )

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Validate company segment matches the user's assigned company
    // (employee of AMENITIES cannot log in via ROOFING segment and vice versa)
    if (company && user.company !== company) {
      return NextResponse.json(
        { error: `This account belongs to the ${user.company === 'AMENITIES' ? 'Laxree Amenities' : 'Laxree Roofing'} segment. Please select the correct segment to log in.` },
        { status: 403 }
      )
    }

    if (!user.isActive || user.isSuspended) {
      return NextResponse.json({ error: 'Account is suspended or inactive' }, { status: 403 })
    }

    // Update last login (retry on Neon cold-start)
    await withDbRetry(() =>
      db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    )

    // Create login history (retry on Neon cold-start)
    await withDbRetry(() =>
      db.loginHistory.create({ data: { userId: user.id } })
    )

    // Create audit log (retry on Neon cold-start)
    await withDbRetry(() =>
      db.auditLog.create({ data: { userId: user.id, action: 'LOGIN', targetType: 'user', targetId: user.id, details: 'User logged in' } })
    )

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        company: user.company,
        profilePhoto: user.profilePhoto,
        isFirstLogin: user.isFirstLogin,
        department: user.department?.name || null,
        designation: user.designation,
        employeeId: user.employeeId,
        aiReadinessScore: user.aiReadinessScore,
        currentLevel: user.currentLevel,
        fieldReady: user.fieldReady,
        inboundReady: user.inboundReady,
      }
    })
  } catch (error: any) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
