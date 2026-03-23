import { useDb, schema } from '~~/server/db'
import { eq, and } from 'drizzle-orm'
import { getSessionUser } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const query = getQuery(event)
  const plantId = query.plantId ? parseInt(query.plantId as string) : null
  
  if (!plantId) {
    throw createError({ statusCode: 400, message: 'plantId is required' })
  }
  
  const db = useDb()
  
  const schedules = await db.select({
    id: schema.plantCare.id,
    plantId: schema.plantCare.plantId,
    frequencyDays: schema.plantCare.frequencyDays,
    notes: schema.plantCare.notes,
    careType: {
      id: schema.careTypes.id,
      name: schema.careTypes.name,
      icon: schema.careTypes.icon
    }
  })
  .from(schema.plantCare)
  .innerJoin(schema.careTypes, eq(schema.plantCare.careTypeId, schema.careTypes.id))
  .where(eq(schema.plantCare.plantId, plantId))
  
  return schedules
})