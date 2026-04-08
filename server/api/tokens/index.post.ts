import { z } from 'zod'
import { getSessionUser } from '~~/server/utils/session'
import { createApiToken } from '~~/server/utils/api-token'

const bodySchema = z.object({
  name: z.string().min(1).max(100)
})

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Name is required (max 100 chars)' })
  }

  const result = await createApiToken(user.id, parsed.data.name)

  return result
})