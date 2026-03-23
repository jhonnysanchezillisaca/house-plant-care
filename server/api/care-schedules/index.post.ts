import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { eq, and } from 'drizzle-orm'
import { getSessionUser } from '~~/server/utils/session'

const bodySchema = z.object({
  plantId: z.number().int().positive(),
  careTypeId: z.number().int().positive(),
  frequencyDays: z.number().int().min(1).max(365),
  notes: z.string().max(500).optional()
})

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }
  
  const { plantId, careTypeId, frequencyDays, notes } = parsed.data
  
  const db = useDb()
  
  const [existingSchedule] = await db.select()
    .from(schema.plantCare)
    .where(and(
      eq(schema.plantCare.plantId, plantId),
      eq(schema.plantCare.careTypeId, careTypeId)
    ))
  
  if (existingSchedule) {
    throw createError({ statusCode: 409, message: 'This care type already has a schedule for this plant' })
  }
  
  const [schedule] = await db.insert(schema.plantCare)
    .values({
      plantId,
      careTypeId,
      frequencyDays,
      notes: notes || null
    })
    .returning()
  
  const [careType] = await db.select()
    .from(schema.careTypes)
    .where(eq(schema.careTypes.id, careTypeId))
  
  return {
    ...schedule,
    careType: careType
  }
})