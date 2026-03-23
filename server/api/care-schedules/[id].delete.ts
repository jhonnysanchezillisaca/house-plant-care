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
    throw createError({ statusCode: 400, message: 'Invalid schedule id' })
  }
  
  const db = useDb()
  
  const [schedule] = await db.delete(schema.plantCare)
    .where(eq(schema.plantCare.id, id))
    .returning()
  
  if (!schedule) {
    throw createError({ statusCode: 404, message: 'Care schedule not found' })
  }
  
  return { success: true, id: schedule.id }
})