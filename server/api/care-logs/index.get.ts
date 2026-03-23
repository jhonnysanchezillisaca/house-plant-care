import { useDb, schema } from '~~/server/db'
import { desc, eq } from 'drizzle-orm'
import { getSessionUser } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const query = getQuery(event)
  const plantId = query.plantId ? parseInt(query.plantId as string) : null
  const limit = query.limit ? parseInt(query.limit as string) : 50
  
  const db = useDb()
  
  let logs
  
  if (plantId) {
    logs = await db.select({
      id: schema.careLogs.id,
      performedAt: schema.careLogs.performedAt,
      notes: schema.careLogs.notes,
      plant: {
        id: schema.plants.id,
        name: schema.plants.name
      },
      careType: {
        id: schema.careTypes.id,
        name: schema.careTypes.name,
        icon: schema.careTypes.icon
      },
      user: {
        id: schema.users.id,
        name: schema.users.name
      }
    })
    .from(schema.careLogs)
    .innerJoin(schema.plants, eq(schema.careLogs.plantId, schema.plants.id))
    .innerJoin(schema.careTypes, eq(schema.careLogs.careTypeId, schema.careTypes.id))
    .innerJoin(schema.users, eq(schema.careLogs.userId, schema.users.id))
    .where(eq(schema.careLogs.plantId, plantId))
    .orderBy(desc(schema.careLogs.performedAt))
    .limit(limit)
  } else {
    logs = await db.select({
      id: schema.careLogs.id,
      performedAt: schema.careLogs.performedAt,
      notes: schema.careLogs.notes,
      plant: {
        id: schema.plants.id,
        name: schema.plants.name
      },
      careType: {
        id: schema.careTypes.id,
        name: schema.careTypes.name,
        icon: schema.careTypes.icon
      },
      user: {
        id: schema.users.id,
        name: schema.users.name
      }
    })
    .from(schema.careLogs)
    .innerJoin(schema.plants, eq(schema.careLogs.plantId, schema.plants.id))
    .innerJoin(schema.careTypes, eq(schema.careLogs.careTypeId, schema.careTypes.id))
    .innerJoin(schema.users, eq(schema.careLogs.userId, schema.users.id))
    .orderBy(desc(schema.careLogs.performedAt))
    .limit(limit)
  }
  
  return logs
})