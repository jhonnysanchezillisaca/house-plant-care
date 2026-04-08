import { randomBytes, createHash } from 'crypto'
import { useDb, schema } from '../db'
import { eq } from 'drizzle-orm'

export function generateToken(): string {
  return `hpc_${randomBytes(32).toString('hex')}`
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function createApiToken(userId: number, name: string): Promise<{ id: number; name: string; token: string; createdAt: Date }> {
  const db = useDb()
  const rawToken = generateToken()
  const tokenHash = hashToken(rawToken)
  const createdAt = new Date()

  const [record] = await db.insert(schema.apiTokens)
    .values({
      userId,
      name,
      tokenHash,
      createdAt
    })
    .returning({ id: schema.apiTokens.id })

  return {
    id: record.id,
    name,
    token: rawToken,
    createdAt
  }
}

export async function validateApiToken(token: string): Promise<{ id: number; userId: number; name: string } | null> {
  const db = useDb()
  const tokenHash = hashToken(token)

  const [record] = await db.select({
    id: schema.apiTokens.id,
    userId: schema.apiTokens.userId,
    name: schema.apiTokens.name
  })
    .from(schema.apiTokens)
    .where(eq(schema.apiTokens.tokenHash, tokenHash))

  if (!record) return null

  await db.update(schema.apiTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(schema.apiTokens.id, record.id))

  return record
}

export async function listApiTokens(userId: number): Promise<{ id: number; name: string; lastUsedAt: Date | null; createdAt: Date }[]> {
  const db = useDb()
  return db.select({
    id: schema.apiTokens.id,
    name: schema.apiTokens.name,
    lastUsedAt: schema.apiTokens.lastUsedAt,
    createdAt: schema.apiTokens.createdAt
  })
    .from(schema.apiTokens)
    .where(eq(schema.apiTokens.userId, userId))
}

export async function deleteApiToken(tokenId: number, userId: number): Promise<boolean> {
  const db = useDb()
  const result = await db.delete(schema.apiTokens)
    .where(eq(schema.apiTokens.id, tokenId))

  return true
}