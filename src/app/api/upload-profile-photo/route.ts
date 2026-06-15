import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('photo') as File | null
    const userId = formData.get('userId') as string | null

    if (!file || !userId) {
      return NextResponse.json({ error: 'Photo and userId are required' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const ext = file.name.split('.').pop() || 'png'
    const filename = `${userId}-${Date.now()}.${ext}`

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profile')
    await mkdir(uploadDir, { recursive: true })

    // Write file
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // Update user profile photo in database
    const photoUrl = `/uploads/profile/${filename}`
    await db.user.update({
      where: { id: userId },
      data: { profilePhoto: photoUrl },
    })

    return NextResponse.json({ photoUrl })
  } catch (error: any) {
    console.error('Profile photo upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
