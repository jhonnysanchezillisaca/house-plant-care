import { useDb, schema } from '~~/server/db'
import { desc } from 'drizzle-orm'
import { getSessionUser } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const db = useDb()
  
  const rooms = await db.select()
    .from(schema.rooms)
    .orderBy(desc(schema.rooms.createdAt))
  
  return rooms
})