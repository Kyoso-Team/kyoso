import * as v from 'valibot';
import { User } from '$src/schema';
import type { DatabaseClient } from '$src/types';
import type { UserValidation } from './validation';
import { eq } from 'drizzle-orm';

async function createUser(db: DatabaseClient, user: v.InferOutput<typeof UserValidation['CreateUser']>) {
  return db.insert(User).values(user).returning({ id: User.id }).then((rows) => rows[0]);
}

async function updateUserBanStatus(db: DatabaseClient, userId: number, ban: boolean) {
  return db.update(User).set({ banned: ban }).where(eq(User.id, userId));
}

export const userRepository = { createUser, updateUserBanStatus };