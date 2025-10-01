import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

const dbType = process.env.DATABASE_TYPE || 'sqlite';

// SQLite Schema
export const usersSqlite = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  surname: text('surname').notNull(),
  gender: text('gender').notNull(),
  isTrusted: integer('is_trusted', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// PostgreSQL Schema
export const usersPostgres = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  surname: varchar('surname', { length: 255 }).notNull(),
  gender: varchar('gender', { length: 50 }).notNull(),
  isTrusted: boolean('is_trusted').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Export the appropriate schema based on database type
export const users = dbType === 'postgresql' ? usersPostgres : usersSqlite;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
