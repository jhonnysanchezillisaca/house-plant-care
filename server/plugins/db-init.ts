import Database from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { defaultCareTypes } from '../db/schema'
import { getDataDir } from '../db'

export default defineNitroPlugin(() => {
  const dataDir = getDataDir()
  const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads')
  
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }
  
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true })
  }
  
  const dbPath = join(dataDir, 'db.sqlite')
  const sqlite = new Database(dbPath)
  
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL REFERENCES rooms(id),
      name TEXT NOT NULL,
      species TEXT,
      image_url TEXT,
      notes TEXT,
      added_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS care_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS plant_care (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plant_id INTEGER NOT NULL REFERENCES plants(id),
      care_type_id INTEGER NOT NULL REFERENCES care_types(id),
      frequency_days INTEGER NOT NULL,
      notes TEXT
    );
    
    CREATE TABLE IF NOT EXISTS care_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plant_id INTEGER NOT NULL REFERENCES plants(id),
      care_type_id INTEGER NOT NULL REFERENCES care_types(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      performed_at INTEGER NOT NULL,
      notes TEXT
    );
    
    CREATE TABLE IF NOT EXISTS api_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      last_used_at INTEGER,
      created_at INTEGER NOT NULL
    );
  `)
  
  const existingCareTypes = sqlite.prepare('SELECT COUNT(*) as count FROM care_types').get() as { count: number }
  
  if (existingCareTypes.count === 0) {
    const insert = sqlite.prepare('INSERT INTO care_types (name, icon) VALUES (?, ?)')
    for (const ct of defaultCareTypes) {
      insert.run(ct.name, ct.icon)
    }
  }
  
  sqlite.close()
})