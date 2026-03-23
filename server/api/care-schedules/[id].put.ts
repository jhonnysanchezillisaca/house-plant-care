import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { eq } from 'drizzle-orm'
import { getSessionUser } from '~~/server/utils/session'

const bodySchema = z.object({
  careTypeId: z.number().int().positive(),
  frequencyDays: z.number().int().min(1).max(365),
  notes: z.string().max(500).optional()
})

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const id = parseInt(event.context.params?.id || '')
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid schedule id' })
  }
  
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }
  
  const { careTypeId, frequencyDays, notes } = parsed.data
  
  const db = useDb()
  
  const [schedule] = await db.update(schema.plantCare)
    .set({
      careTypeId,
      frequencyDays,
      notes: notes || null
    })
    .where(eq(schema.plantCare.id, id))
    .returning()
  
  if (!schedule) {
    throw createError({ statusCode: 404, message: 'Care schedule not found' })
  }
  
  const [careType] = await db.select()
    .from(schema.careTypes)
    .where(eq(schema.careTypes.id, careTypeId))
  
  return {
    ...schedule,
    careType: careType
  }
})