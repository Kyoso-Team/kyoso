import { defineConfig } from 'drizzle-kit';

const DATABASE_URL = Bun.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export default defineConfig({
  schema: './src/lib/server/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  verbose: true,
  dbCredentials: {
    url: DATABASE_URL
  }
});
