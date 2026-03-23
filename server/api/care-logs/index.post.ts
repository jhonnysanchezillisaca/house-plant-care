import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { eq } from 'drizzle-orm'
import { getSessionUser } from '~~/server/utils/session'

const bodySchema = z.object({
  plantId: z.number().int().positive(),
  careTypeId: z.number().int().positive(),
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
  
  const { plantId, careTypeId, notes } = parsed.data
  
  const db = useDb()
  
  const [plant] = await db.select()
    .from(schema.plants)
    .where(eq(schema.plants.id, plantId))
  
  if (!plant) {
    throw createError({ statusCode: 404, message: 'Plant not found' })
  }
  
  const [careType] = await db.select()
    .from(schema.careTypes)
    .where(eq(schema.careTypes.id, careTypeId))
  
  if (!careType) {
    throw createError({ statusCode: 404, message: 'Care type not found' })
  }
  
  const [log] = await db.insert(schema.careLogs)
    .values({
      plantId,
      careTypeId,
      userId: user.id,
      performedAt: new Date(),
      notes: notes || null
    })
    .returning()
  
  return {
    ...log,
    plant: { id: plant.id, name: plant.name },
    careType: { id: careType.id, name: careType.name, icon: careType.icon },
    user: { id: user.id, name: user.name }
  }
})