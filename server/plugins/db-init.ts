import Database from 'better-sqlite3'
import { join } from 'path'
import { defaultCareTypes } from '../db/schema'

export default defineNitroPlugin(async () => {
  const dbPath = join(process.cwd(), 'data', 'db.sqlite')
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
  `)
  
  const existingCareTypes = sqlite.prepare('SELECT COUNT(*) as count FROM care_types').get() as { count: number }
  
  if (existingCareTypes.count === 0) {
    const insert = sqlite.prepare('INSERT INTO care_types (name, icon) VALUES (?, ?)')
    for (const ct of defaultCareTypes) {
      insert.run(ct.name, ct.icon)
    }
    console.log('Seeded default care types')
  }
  
  sqlite.close()
})