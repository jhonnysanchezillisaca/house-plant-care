import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { eq } from 'drizzle-orm'
import { getSessionUser } from '~~/server/utils/session'

const bodySchema = z.object({
  name: z.string().min(1).max(100),
  roomId: z.number().int().positive(),
  species: z.string().max(200).optional(),
  imageUrl: z.string().url().optional().or(z.string().max(500).optional()),
  notes: z.string().max(1000).optional()
})

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const id = parseInt(event.context.params?.id || '')
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid plant id' })
  }
  
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }
  
  const { name, roomId, species, imageUrl, notes } = parsed.data
  
  const db = useDb()
  
  const [plant] = await db.update(schema.plants)
    .set({
      name,
      roomId,
      species: species || null,
      imageUrl: imageUrl || null,
      notes: notes || null
    })
    .where(eq(schema.plants.id, id))
    .returning()
  
  if (!plant) {
    throw createError({ statusCode: 404, message: 'Plant not found' })
  }
  
  return plant
})