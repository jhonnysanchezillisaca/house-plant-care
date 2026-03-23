import bcrypt from 'bcrypt'
import { useDb, schema } from '../db'
import { eq } from 'drizzle-orm'
import type { User } from 'server/db/schema'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
  const db = useDb()
  const passwordHash = await hashPassword(password)
  
  const [user] = await db.insert(schema.users)
    .values({
      email,
      passwordHash,
      name,
      createdAt: new Date()
    })
    .returning()
  
  return user
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = useDb()
  const [user] = await db.select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
  
  return user
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = useDb()
  const [user] = await db.select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
  
  return user
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email)
  if (!user) return null
  
  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) return null
  
  return user
}