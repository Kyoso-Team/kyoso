import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$src/utils/env';

const client = postgres(env.NODE_ENV === 'test' ? env.TEST_DATABASE_URL : env.DATABASE_URL, {
  onnotice: () => {}
});
export const db = drizzle(client, { casing: 'snake_case', logger: true });
