import type { DatabaseClient } from '$src/types';
import { env } from '$src/utils/env';

async function resetDatabase(db: DatabaseClient) {
  if (env.NODE_ENV === 'production') return;
  await db.execute('drop extension if exists "pg_trgm" cascade');
  await db.execute('drop schema if exists "public" cascade');
  await db.execute('create schema "public"');
  await db.execute('drop schema if exists "drizzle" cascade');
  await db.execute('create schema "drizzle"');
}

async function prePushDatabase(db: DatabaseClient) {
  if (env.NODE_ENV === 'production') return;
  await db.execute('create extension "pg_trgm"');
}

export const databaseRepository = { resetDatabase, prePushDatabase };
