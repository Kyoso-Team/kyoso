import * as v from 'valibot';
import { User } from '$src/schema';
import type { DatabaseClient } from '$src/types';
import type { UserValidation } from './validation';

async function createUser(db: DatabaseClient, user: v.InferOutput<typeof UserValidation['CreateUser']>) {
  return db.insert(User).values(user).returning({ id: User.id }).then((rows) => rows[0]);
}

export const userRepository = { createUser };