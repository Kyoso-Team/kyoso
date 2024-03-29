import env from '$lib/server/env';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const client = postgres(env.DATABASE_URL, {
  debug: true
});
export const db = drizzle(client);

export { uniqueConstraints } from './schema-utils';
export * from './schema';
