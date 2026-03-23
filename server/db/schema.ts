import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations, InferSelectModel } from 'drizzle-orm'

export type User = InferSelectModel<typeof users>
export type Room = InferSelectModel<typeof rooms>
export type Plant = InferSelectModel<typeof plants>
export type CareType = InferSelectModel<typeof careTypes>
export type PlantCare = InferSelectModel<typeof plantCare>
export type CareLog = InferSelectModel<typeof careLogs>

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const rooms = sqliteTable('rooms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const plants = sqliteTable('plants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomId: integer('room_id').notNull().references(() => rooms.id),
  name: text('name').notNull(),
  species: text('species'),
  imageUrl: text('image_url'),
  notes: text('notes'),
  addedAt: integer('added_at', { mode: 'timestamp' }).notNull()
})

export const careTypes = sqliteTable('care_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  icon: text('icon').notNull()
})

export const plantCare = sqliteTable('plant_care', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  plantId: integer('plant_id').notNull().references(() => plants.id),
  careTypeId: integer('care_type_id').notNull().references(() => careTypes.id),
  frequencyDays: integer('frequency_days').notNull(),
  notes: text('notes')
})

export const careLogs = sqliteTable('care_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  plantId: integer('plant_id').notNull().references(() => plants.id),
  careTypeId: integer('care_type_id').notNull().references(() => careTypes.id),
  userId: integer('user_id').notNull().references(() => users.id),
  performedAt: integer('performed_at', { mode: 'timestamp' }).notNull(),
  notes: text('notes')
})

export const usersRelations = relations(users, ({ many }) => ({
  careLogs: many(careLogs)
}))

export const roomsRelations = relations(rooms, ({ many }) => ({
  plants: many(plants)
}))

export const plantsRelations = relations(plants, ({ one, many }) => ({
  room: one(rooms, {
    fields: [plants.roomId],
    references: [rooms.id]
  }),
  plantCare: many(plantCare),
  careLogs: many(careLogs)
}))

export const careTypesRelations = relations(careTypes, ({ many }) => ({
  plantCare: many(plantCare),
  careLogs: many(careLogs)
}))

export const plantCareRelations = relations(plantCare, ({ one }) => ({
  plant: one(plants, {
    fields: [plantCare.plantId],
    references: [plants.id]
  }),
  careType: one(careTypes, {
    fields: [plantCare.careTypeId],
    references: [careTypes.id]
  })
}))

export const careLogsRelations = relations(careLogs, ({ one }) => ({
  plant: one(plants, {
    fields: [careLogs.plantId],
    references: [plants.id]
  }),
  careType: one(careTypes, {
    fields: [careLogs.careTypeId],
    references: [careTypes.id]
  }),
  user: one(users, {
    fields: [careLogs.userId],
    references: [users.id]
  })
}))

export const defaultCareTypes = [
  { name: 'water', icon: 'droplet' },
  { name: 'fertilizer', icon: 'flask-conical' },
  { name: 'mist', icon: 'cloud' },
  { name: 'prune', icon: 'scissors' },
  { name: 'repot', icon: 'flower-2' },
  { name: 'check', icon: 'eye' },
  { name: 'rotate', icon: 'rotate-cw' },
  { name: 'clean_leaves', icon: 'sparkles' },
  { name: 'propagate', icon: 'branching' }
]