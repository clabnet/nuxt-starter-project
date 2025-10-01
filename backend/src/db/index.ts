import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePostgres } from 'drizzle-orm/node-postgres';
import Database from 'better-sqlite3';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const dbType = process.env.DATABASE_TYPE || 'sqlite';

let db: any;

if (dbType === 'postgresql') {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  db = drizzlePostgres(pool);
} else {
  const sqlite = new Database(process.env.DATABASE_URL || './db.sqlite');
  db = drizzleSqlite(sqlite);
}

export { db };
