import { eq, sql } from 'drizzle-orm';
import { Country, DiscordUser, OsuUser, User } from '$src/schema';
import { pick } from '$src/utils/query';
import type { DatabaseClient, Selection } from '$src/types';
import type { UserValidationOutput } from './validation';

class UserRepository {
  public async createUser(db: DatabaseClient, user: UserValidationOutput['CreateUser']) {
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

  public async createCountry(db: DatabaseClient, country: UserValidationOutput['CreateCountry']) {
    return db.insert(Country).values(country).onConflictDoNothing({
      target: Country.code
    });
  }

  public async createOsuUser(db: DatabaseClient, user: UserValidationOutput['CreateOsuUser']) {
    return db.insert(OsuUser).values(user);
  }

  public async updateOsuUser(
    db: DatabaseClient,
    user: UserValidationOutput['UpdateOsuUser'],
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

  public async getOsuUser<T extends Selection<typeof OsuUser>>(
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

  public async createDiscordUser(
    db: DatabaseClient,
    user: UserValidationOutput['CreateDiscordUser']
  ) {
    return db.insert(DiscordUser).values(user);
  }

  public async updateDiscordUser(
    db: DatabaseClient,
    user: UserValidationOutput['UpdateDiscordUser'],
    discordUserId: bigint
  ) {
    return db
      .update(DiscordUser)
      .set({
        updatedAt: sql`now()`,
        ...user
      })
      .where(eq(DiscordUser.discordUserId, discordUserId));
  }

  public async updateUser(
    db: DatabaseClient,
    user: UserValidationOutput['UpdateUser'],
    userId: number
  ) {
    const { admin, approvedHost } = user;

    return db
      .update(User)
      .set({
        admin,
        approvedHost
      })
      .where(eq(User.id, userId));
  }
}

export const userRepository = new UserRepository();
