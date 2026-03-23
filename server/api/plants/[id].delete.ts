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
    throw createError({ statusCode: 400, message: 'Invalid plant id' })
  }
  
  const db = useDb()
  
  const [plant] = await db.delete(schema.plants)
    .where(eq(schema.plants.id, id))
    .returning()
  
  if (!plant) {
    throw createError({ statusCode: 404, message: 'Plant not found' })
  }
  
  return { success: true, id: plant.id }
})