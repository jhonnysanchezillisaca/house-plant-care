import { useDb, schema } from '~~/server/db'
import { desc, eq, inArray } from 'drizzle-orm'
import { getSessionUser } from '~~/server/utils/session'

interface OverdueItem {
  plantId: number
  plantName: string
  roomId: number
  roomName: string
  careTypeId: number
  careTypeName: string
  careTypeIcon: string
  frequencyDays: number
  lastPerformedAt: string | null
  daysOverdue: number
}

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const db = useDb()
  
  const plants = await db.select({
    id: schema.plants.id,
    name: schema.plants.name,
    roomId: schema.plants.roomId
  }).from(schema.plants)
  
  if (plants.length === 0) {
    return []
  }
  
  const schedules = await db.select({
    id: schema.plantCare.id,
    plantId: schema.plantCare.plantId,
    careTypeId: schema.plantCare.careTypeId,
    frequencyDays: schema.plantCare.frequencyDays,
    careTypeName: schema.careTypes.name,
    careTypeIcon: schema.careTypes.icon
  })
  .from(schema.plantCare)
  .innerJoin(schema.careTypes, eq(schema.plantCare.careTypeId, schema.careTypes.id))
  
  const roomIds = [...new Set(plants.map(p => p.roomId))]
  const rooms = roomIds.length > 0 
    ? await db.select().from(schema.rooms).where(inArray(schema.rooms.id, roomIds))
    : []
  
  const roomMap = new Map(rooms.map(r => [r.id, r]))
  
  const logs = await db.select({
    plantId: schema.careLogs.plantId,
    careTypeId: schema.careLogs.careTypeId,
    performedAt: schema.careLogs.performedAt
  })
  .from(schema.careLogs)
  .orderBy(desc(schema.careLogs.performedAt))
  
  const lastLogMap = new Map<string, Date>()
  for (const log of logs) {
    const key = `${log.plantId}-${log.careTypeId}`
    if (!lastLogMap.has(key)) {
      lastLogMap.set(key, new Date(log.performedAt))
    }
  }
  
  const overdue: OverdueItem[] = []
  const now = new Date()
  
  for (const schedule of schedules) {
    const plant = plants.find(p => p.id === schedule.plantId)
    if (!plant) continue
    
    const room = roomMap.get(plant.roomId)
    const key = `${schedule.plantId}-${schedule.careTypeId}`
    const lastPerformed = lastLogMap.get(key)
    
    const daysSinceLastCare = lastPerformed 
      ? Math.floor((now.getTime() - lastPerformed.getTime()) / (1000 * 60 * 60 * 24))
      : schedule.frequencyDays + 1
    
    const daysOverdue = daysSinceLastCare - schedule.frequencyDays
    
    if (daysOverdue > 0) {
      overdue.push({
        plantId: plant.id,
        plantName: plant.name,
        roomId: plant.roomId,
        roomName: room?.name || 'Unknown',
        careTypeId: schedule.careTypeId,
        careTypeName: schedule.careTypeName,
        careTypeIcon: schedule.careTypeIcon,
        frequencyDays: schedule.frequencyDays,
        lastPerformedAt: lastPerformed?.toISOString() || null,
        daysOverdue
      })
    }
  }
  
  overdue.sort((a, b) => b.daysOverdue - a.daysOverdue)
  
  return overdue
})