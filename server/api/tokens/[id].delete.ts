import { getSessionUser } from '~~/server/utils/session'
import { deleteApiToken } from '~~/server/utils/api-token'
import { eq, and } from 'drizzle-orm'
import { useDb, schema } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  const tokenId = parseInt(getRouterParam(event, 'id') || '')
  if (!tokenId) {
    throw createError({ statusCode: 400, message: 'Invalid token ID' })
  }

  const db = useDb()
  const [token] = await db.select({ id: schema.apiTokens.id, userId: schema.apiTokens.userId })
    .from(schema.apiTokens)
    .where(and(eq(schema.apiTokens.id, tokenId), eq(schema.apiTokens.userId, user.id)))

  if (!token) {
    throw createError({ statusCode: 404, message: 'Token not found' })
  }

  await db.delete(schema.apiTokens).where(eq(schema.apiTokens.id, tokenId))

  return { success: true }
})