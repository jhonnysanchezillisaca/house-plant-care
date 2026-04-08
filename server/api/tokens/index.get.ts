import { getSessionUser } from '~~/server/utils/session'
import { listApiTokens } from '~~/server/utils/api-token'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  const tokens = await listApiTokens(user.id)

  return tokens.map(t => ({
    id: t.id,
    name: t.name,
    lastUsedAt: t.lastUsedAt?.toISOString() || null,
    createdAt: t.createdAt.toISOString()
  }))
})