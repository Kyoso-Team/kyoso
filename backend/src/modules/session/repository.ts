import * as v from 'valibot';
import type { DatabaseClient } from '$src/types';
import type { SessionValidation } from './validation';
import { Session } from '$src/schema';
import { sql } from 'drizzle-orm';

async function createSession(db: DatabaseClient, session: v.InferOutput<typeof SessionValidation['CreateSession']>) {
  return db.insert(Session).values({
    expiresAt: sql`now() + interval '3 months'`,
    ...session
  });
}

export const sessionRepository = { createSession };
