import { z } from 'zod'
import { authenticateUser } from '~~/server/utils/auth'
import { setSessionUser } from '~~/server/utils/session'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid input'
    })
  }
  
  const { email, password } = parsed.data
  
  const user = await authenticateUser(email, password)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password'
    })
  }
  
  await setSessionUser(event, user.id)
  
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  }
})