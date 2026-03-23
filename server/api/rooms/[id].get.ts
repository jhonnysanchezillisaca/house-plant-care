import { useDb, schema } from '~~/server/db'
import { eq } from 'drizzle-orm'
import { getSessionUser } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const id = parseInt(event.context.params?.id || '')
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid room id' })
  }
  
  const db = useDb()
  
  const [room] = await db.select()
    .from(schema.rooms)
    .where(eq(schema.rooms.id, id))
  
  if (!room) {
    throw createError({ statusCode: 404, message: 'Room not found' })
  }
  
  return room
})