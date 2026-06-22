import { join } from 'path'
import { existsSync } from 'fs'

const UPLOAD_DIR = '/home/z/my-project/upload'

// Test the same logic as the API
const testFiles = ['Mini Bar.pdf', 'Safe Box.pdf', 'Electric Kettle Trainig PPT_11zon.pdf']
for (const file of testFiles) {
  const sanitizedFile = file.replace(/\.\./g, '').replace(/\/\//g, '/')
  const filePath = join(UPLOAD_DIR, sanitizedFile)
  console.log(`File: "${file}"`)
  console.log(`  Path: ${filePath}`)
  console.log(`  Exists: ${existsSync(filePath)}`)
}
