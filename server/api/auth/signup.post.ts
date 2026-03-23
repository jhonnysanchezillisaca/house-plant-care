import { z } from 'zod'
import { createUser, getUserByEmail } from '~~/server/utils/auth'
import { setSessionUser } from '~~/server/utils/session'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1)
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

  const { email, password, name } = parsed.data

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: 'Email already registered'
    })
  }

  const user = await createUser(email, password, name)

  await setSessionUser(event, user.id)

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  }
})