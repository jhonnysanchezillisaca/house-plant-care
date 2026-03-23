import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { getSessionUser } from '~~/server/utils/session'

const bodySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional()
})

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }
  
  const { name, description } = parsed.data
  
  const db = useDb()
  
  const [room] = await db.insert(schema.rooms)
    .values({
      name,
      description: description || null,
      createdAt: new Date()
    })
    .returning()
  
  return room
})