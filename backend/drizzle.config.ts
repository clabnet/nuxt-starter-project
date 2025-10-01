
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const dbType = process.env.DATABASE_TYPE || 'sqlite';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: dbType === 'postgresql' ? 'postgresql' : 'sqlite',
  dbCredentials:
    dbType === 'postgresql'
      ? {
        url: process.env.DATABASE_URL as string,
      }
      : {
        url: process.env.DATABASE_URL || './db.sqlite',
      },
} satisfies Config;