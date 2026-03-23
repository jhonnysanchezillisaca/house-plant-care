import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import * as schema from './schema'
import { join } from 'path'

let _db: ReturnType<typeof drizzle> | null = null

export function useDb() {
  if (_db) return _db
  
  const dbPath = join(process.cwd(), 'data', 'db.sqlite')
  const sqlite = new Database(dbPath)
  _db = drizzle(sqlite, { schema })
  
  return _db
}

export { schema }