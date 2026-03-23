import { useDb, schema } from '~~/server/db'
import { getSessionUser } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const db = useDb()
  
  const careTypes = await db.select().from(schema.careTypes)
  
  return careTypes
})