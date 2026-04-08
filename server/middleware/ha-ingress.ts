import { useDb, schema } from '../db'
import { eq } from 'drizzle-orm'
import { hashPassword } from '../utils/auth'
import { useSession } from 'h3'
import type { User } from '../db/schema'

const HA_ADDON = process.env.HA_ADDON === 'true'
const HA_DEFAULT_EMAIL = 'homeassistant'
const HA_DEFAULT_NAME = 'Home Assistant'

const SESSION_PASSWORD = process.env.NUXT_SESSION_PASSWORD || 'change-me-to-a-secure-secret-password-min-32-chars'

interface SessionData {
  userId: number
}

export default defineEventHandler(async (event) => {
  if (!HA_ADDON) return

  setResponseHeaders(event, {
    'X-Frame-Options': 'ALLOWALL',
    'Content-Security-Policy': "frame-ancestors 'self' http://homeassistant.local:* http://homeassistant:*;"
  })

  const session = await useSession(event, { password: SESSION_PASSWORD })
  const userId = (session.data as SessionData)?.userId

  if (!userId) {
    const db = useDb()
    const [existing] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.email, HA_DEFAULT_EMAIL))
      .limit(1)

    let uid: number
    if (!existing) {
      const passwordHash = await hashPassword('homeassistant')
      const [user] = await db.insert(schema.users)
        .values({
          email: HA_DEFAULT_EMAIL,
          passwordHash,
          name: HA_DEFAULT_NAME,
          createdAt: new Date()
        })
        .returning({ id: schema.users.id })
      uid = user.id
    } else {
      uid = existing.id
    }

    await session.update({ userId: uid } as SessionData)
  }
})