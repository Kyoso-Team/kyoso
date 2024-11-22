import * as v from 'valibot';
import { OsuUser } from '$src/schema';
import type { DatabaseClient } from '$src/types';
import type { OsuUserValidation } from './validation';
import { eq } from 'drizzle-orm';

async function createOsuUser(db: DatabaseClient, user: v.InferOutput<typeof OsuUserValidation['CreateOsuUser']>) {
  return db.insert(OsuUser).values(user);
}

async function updateOsuUser(db: DatabaseClient, user: v.InferOutput<typeof OsuUserValidation['UpdateOsuUser']>, osuUserId: number) {
  return db.update(OsuUser).set(user).where(eq(OsuUser.osuUserId, osuUserId));
}

export const osuUserRepository = { createOsuUser, updateOsuUser };