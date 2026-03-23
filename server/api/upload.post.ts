import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { getSessionUser } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const files = await readMultipartFormData(event)
  
  if (!files || !files.length) {
    throw createError({ statusCode: 400, message: 'No file uploaded' })
  }
  
  const file = files[0]
  
  if (!file.filename || !file.data) {
    throw createError({ statusCode: 400, message: 'Invalid file' })
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type || '')) {
    throw createError({ 
      statusCode: 400, 
      message: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
    })
  }
  
  const maxSize = 5 * 1024 * 1024
  if (file.data.length > maxSize) {
    throw createError({ 
      statusCode: 400, 
      message: 'File too large. Maximum size is 5MB.' 
    })
  }
  
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }
  
  const ext = file.filename.split('.').pop() || 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
  const filepath = join(uploadDir, filename)
  
  await writeFile(filepath, file.data)
  
  return {
    url: `/uploads/${filename}`,
    filename
  }
})