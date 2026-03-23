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
    throw createError({ statusCode: 400, message: 'Invalid log id' })
  }
  
  const db = useDb()
  
  const [log] = await db.delete(schema.careLogs)
    .where(eq(schema.careLogs.id, id))
    .returning()
  
  if (!log) {
    throw createError({ statusCode: 404, message: 'Log not found' })
  }
  
  return { success: true, id: log.id }
})