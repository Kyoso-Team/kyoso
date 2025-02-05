import { defineConfig } from 'drizzle-kit';

const DATABASE_URL =
  process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  verbose: true,
  casing: 'snake_case',
  dbCredentials: {
    url: DATABASE_URL
  }
});
