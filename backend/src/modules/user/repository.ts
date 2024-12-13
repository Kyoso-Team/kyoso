import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { User } from '$src/schema';
import type { DatabaseClient, Selection } from '$src/types';
import type { UserValidation } from './validation';
import { pick } from '$src/utils/query';

async function createUser(
  db: DatabaseClient,
  user: v.InferOutput<(typeof UserValidation)['CreateUser']>
) {
  return db
    .insert(User)
    .values(user)
    .returning({ id: User.id })
    .then((rows) => rows[0]);
}

async function updateUserBanStatus(db: DatabaseClient, userId: number, ban: boolean) {
  return db.update(User).set({ banned: ban }).where(eq(User.id, userId));
}

async function getUser<T extends Selection<typeof User>>(db: DatabaseClient, userId: number, select: T) {
  return db.select(pick(User, select)).from(User).where(eq(User.id, userId)).then((rows) => rows[0]);
}

export const userRepository = { createUser, updateUserBanStatus, getUser };
