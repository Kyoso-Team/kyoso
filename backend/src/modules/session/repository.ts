import { sql } from 'drizzle-orm';
import * as v from 'valibot';
import { Session } from '$src/schema';
import type { DatabaseClient } from '$src/types';
import type { SessionValidation } from './validation';

async function createSession(
  db: DatabaseClient,
  session: v.InferOutput<(typeof SessionValidation)['CreateSession']>
) {
  return db.insert(Session).values({
    expiresAt: sql`now() + interval '3 months'`,
    ...session
  });
}

export const sessionRepository = { createSession };
