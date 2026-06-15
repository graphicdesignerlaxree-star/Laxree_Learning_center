import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join, extname } from 'path'
import { existsSync } from 'fs'

const UPLOAD_DIR = '/home/z/my-project/upload'

const MIME_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const file = searchParams.get('file')

    if (!file) {
      return NextResponse.json({ error: 'File parameter is required' }, { status: 400 })
    }

    // Sanitize the file path to prevent directory traversal
    const sanitizedFile = file.replace(/\.\./g, '').replace(/\/\//g, '/')
    const filePath = join(UPLOAD_DIR, sanitizedFile)

    // Ensure the path is within UPLOAD_DIR
    if (!filePath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 })
    }

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const fileStat = await stat(filePath)
    const ext = extname(filePath).toLowerCase()
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream'

    // For video files, support range requests for streaming
    const range = request.headers.get('range')
    if (range && ext === '.mp4') {
      const fileSize = fileStat.size
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunkSize = end - start + 1

      const fileBuffer = await readFile(filePath)
      const chunk = fileBuffer.subarray(start, end + 1)

      return new NextResponse(chunk, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }

    // For non-video files or non-range requests
    const fileBuffer = await readFile(filePath)

    const headers: Record<string, string> = {
      'Content-Type': mimeType,
      'Content-Length': fileStat.size.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
    }

    // For PDFs, set content-disposition to inline for viewing in browser
    if (ext === '.pdf') {
      headers['Content-Disposition'] = `inline; filename="${encodeURIComponent(sanitizedFile.split('/').pop() || 'file')}"`
    }

    return new NextResponse(fileBuffer, { headers })
  } catch (error: any) {
    console.error('File serve error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
