import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
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
  
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }
  
  const { name, roomId, species, imageUrl, notes } = parsed.data
  
  const db = useDb()
  
  const [room] = await db.select()
    .from(schema.rooms)
    .where(schema.rooms.id)
  
  const [plant] = await db.insert(schema.plants)
    .values({
      name,
      roomId,
      species: species || null,
      imageUrl: imageUrl || null,
      notes: notes || null,
      addedAt: new Date()
    })
    .returning()
  
  return plant
})