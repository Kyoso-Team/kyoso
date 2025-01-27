import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { User } from '$src/schema';
import { pick } from '$src/utils/query';
import type { DatabaseClient, Selection } from '$src/types';
import type { UserValidationT } from './validation';

class UserRepository {
  public async createUser(db: DatabaseClient, user: v.InferOutput<UserValidationT['CreateUser']>) {
    return db
      .insert(User)
      .values(user)
      .returning({ id: User.id })
      .then((rows) => rows[0]);
  }

  public async updateUserBanStatus(db: DatabaseClient, userId: number, ban: boolean) {
    return db.update(User).set({ banned: ban }).where(eq(User.id, userId));
  }

  public async getUser<T extends Selection<typeof User>>(
    db: DatabaseClient,
    userId: number,
    select: T
  ) {
    return db
      .select(pick(User, select))
      .from(User)
      .where(eq(User.id, userId))
      .then((rows) => rows[0]);
  }
}

export const userRepository = new UserRepository();
