import { sql, Table } from 'drizzle-orm';
import { env } from '$src/utils/env';
import type { SQL } from 'drizzle-orm';
import type { DatabaseClient } from '$src/types';

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

async function exists(db: DatabaseClient, table: Table, where: SQL | undefined) {
  return await db
    .execute(sql`select exists(select 1 as "exists" from ${table} where ${where})`)
    .then(([{ exists }]) => !!exists);
}

export const databaseRepository = { resetDatabase, prePushDatabase, exists };
