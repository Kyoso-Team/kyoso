import { eq, sql } from 'drizzle-orm';
import * as v from 'valibot';
import { OsuUser } from '$src/schema';
import { pick } from '$src/utils/query';
import type { DatabaseClient, Selection } from '$src/types';
import type { OsuUserValidation } from './validation';

async function createOsuUser(
  db: DatabaseClient,
  user: v.InferOutput<(typeof OsuUserValidation)['CreateOsuUser']>
) {
  return db.insert(OsuUser).values(user);
}

async function updateOsuUser(
  db: DatabaseClient,
  user: v.InferOutput<(typeof OsuUserValidation)['UpdateOsuUser']>,
  osuUserId: number
) {
  return db
    .update(OsuUser)
    .set({
      updatedAt: sql`now()`,
      ...user
    })
    .where(eq(OsuUser.osuUserId, osuUserId));
}

async function getOsuUser<T extends Selection<typeof OsuUser>>(
  db: DatabaseClient,
  osuUserId: number,
  select: T
) {
  return db
    .select(pick(OsuUser, select))
    .from(OsuUser)
    .where(eq(OsuUser.osuUserId, osuUserId))
    .then((rows) => rows.at(0));
}

export const osuUserRepository = { createOsuUser, updateOsuUser, getOsuUser };
