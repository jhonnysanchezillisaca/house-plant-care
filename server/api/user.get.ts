import { getSessionUser } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Not authenticated'
    })
  }
  
  return user
})