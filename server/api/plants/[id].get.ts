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
  
  const [plant] = await db.select({
    id: schema.plants.id,
    name: schema.plants.name,
    species: schema.plants.species,
    imageUrl: schema.plants.imageUrl,
    notes: schema.plants.notes,
    addedAt: schema.plants.addedAt,
    roomId: schema.plants.roomId,
    room: {
      id: schema.rooms.id,
      name: schema.rooms.name,
      description: schema.rooms.description
    }
  })
  .from(schema.plants)
  .leftJoin(schema.rooms, eq(schema.plants.roomId, schema.rooms.id))
  .where(eq(schema.plants.id, id))
  
  if (!plant) {
    throw createError({ statusCode: 404, message: 'Plant not found' })
  }
  
  return plant
})