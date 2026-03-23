import { useDb, schema } from '~~/server/db'
import { desc, eq, inArray } from 'drizzle-orm'
import { getSessionUser } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const query = getQuery(event)
  const roomId = query.roomId ? parseInt(query.roomId as string) : null
  
  const db = useDb()
  
  let plants
  
  if (roomId) {
    plants = await db
      .select()
      .from(schema.plants)
      .where(eq(schema.plants.roomId, roomId))
      .orderBy(desc(schema.plants.addedAt))
  } else {
    plants = await db
      .select()
      .from(schema.plants)
      .orderBy(desc(schema.plants.addedAt))
  }
  
  if (plants.length === 0) {
    return []
  }
  
  const roomIds = [...new Set(plants.map(p => p.roomId))]
  const rooms = await db
    .select()
    .from(schema.rooms)
    .where(inArray(schema.rooms.id, roomIds))
  
  const roomMap = new Map(rooms.map(r => [r.id, r]))
  
  return plants.map(p => ({
    id: p.id,
    name: p.name,
    species: p.species,
    imageUrl: p.imageUrl,
    addedAt: p.addedAt,
    roomId: p.roomId,
    room: roomMap.get(p.roomId) ? { id: p.roomId, name: roomMap.get(p.roomId)!.name } : null
  }))
})