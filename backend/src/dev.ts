import { sql } from 'drizzle-orm';
import { Country, OsuBadge, Tournament, User } from './schema';
import { db } from './singletons';
import { env } from './utils/env';
import type { PgTable } from 'drizzle-orm/pg-core';

if (env.NODE_ENV === 'production') {
  throw new Error("Don't import this file in production");
}

export async function resetDatabase() {
  await db.execute('drop schema if exists "public" cascade');
  await db.execute('create schema "public"');
  await db.execute('drop schema if exists "drizzle" cascade');
  await db.execute('create schema "drizzle"');
}

export async function truncateTables() {
  const tables = [User, Country, OsuBadge, Tournament];
  for (const table of tables) {
    await truncateTable(table);
  }
}

export async function truncateTable(table: PgTable) {
  await db.execute(sql`truncate table ${table} restart identity cascade`);
}
