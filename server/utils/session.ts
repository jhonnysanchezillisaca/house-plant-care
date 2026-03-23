import { useSession } from 'h3'
import { getUserById } from './auth'
import type { User } from 'server/db/schema'

declare module 'h3' {
  interface H3EventContext {
    user?: Omit<User, 'passwordHash'>
  }
}

const SESSION_PASSWORD = process.env.NUXT_SESSION_PASSWORD || 'change-me-to-a-secure-secret-password-min-32-chars'

interface SessionData {
  userId: number
}

export async function getSessionUser(event: any): Promise<Omit<User, 'passwordHash'> | null> {
  const session = await useSession(event, { password: SESSION_PASSWORD })
  
  const userId = (session.data as SessionData)?.userId
  if (!userId) return null
  
  const user = await getUserById(userId)
  if (!user) return null
  
  const { passwordHash: _, ...safeUser } = user
  return safeUser
}

export async function setSessionUser(event: any, userId: number) {
  const session = await useSession(event, { password: SESSION_PASSWORD })
  await session.update({ userId } as SessionData)
}

export async function clearSessionUser(event: any) {
  const session = await useSession(event, { password: SESSION_PASSWORD })
  await session.clear()
}