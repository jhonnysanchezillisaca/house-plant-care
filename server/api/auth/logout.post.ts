import { clearSessionUser } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  await clearSessionUser(event)
  return { success: true }
})