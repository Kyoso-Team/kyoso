import { User } from '$src/schema';
import type { DatabaseClient } from '$src/types';
import { env } from '$src/utils/env';
import type { UserValidationOutput } from './validation';

async function createUser(db: DatabaseClient, user: UserValidationOutput['CreateUser']) {
  const isKyosoOwner = env.KYOSO_OWNER === user.osuUserId;
  return db.insert(User).values({
    admin: isKyosoOwner,
    approvedHost: isKyosoOwner
  }).returning({ id: User.id }).then((rows) => rows[0]);
}

export const userRepository = { createUser };