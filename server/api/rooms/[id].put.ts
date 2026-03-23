import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { eq } from 'drizzle-orm'
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
  
  const id = parseInt(event.context.params?.id || '')
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid room id' })
  }
  
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }
  
  const { name, description } = parsed.data
  
  const db = useDb()
  
  const [room] = await db.update(schema.rooms)
    .set({
      name,
      description: description || null
    })
    .where(eq(schema.rooms.id, id))
    .returning()
  
  if (!room) {
    throw createError({ statusCode: 404, message: 'Room not found' })
  }
  
  return room
})