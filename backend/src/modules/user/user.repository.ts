import { and, eq, sql } from 'drizzle-orm';
import { Country, DiscordUser, OsuUser, User } from '$src/schema';
import { pick } from '$src/utils/query';
import type { DatabaseClient } from '$src/types';
import { DbRepository } from '$src/modules/_base/repository';

class UserDbRepository extends DbRepository {
  public createUser(db: DatabaseClient, user: typeof User.$inferInsert) {
    const query = db
      .insert(User)
      .values(user)
      .returning({ id: User.id });

    return this.wrap({
      query,
      name: 'Create user',
      map: this.map.firstRow
    });
  }

  public createCountry(db: DatabaseClient, country: typeof Country.$inferInsert) {
    const query = db.insert(Country).values(country).onConflictDoNothing({
      target: Country.code
    });

    return this.wrap({
      query,
      name: 'Create country'
    });
  }

  public createOsuUser(db: DatabaseClient, user: typeof OsuUser.$inferInsert) {
    const query = db.insert(OsuUser).values(user);

    return this.wrap({
      query,
      name: 'Create osu! user',
      map: this.map.firstRow
    });
  }

  public createDiscordUser(
    db: DatabaseClient,
    user: typeof DiscordUser.$inferInsert
  ) {
    const query = db.insert(DiscordUser).values(user);

    return this.wrap({
      query,
      name: 'Create Discord user'
    });
  }

  public updateUser(
    db: DatabaseClient,
    userId: number,
    user: Partial<Pick<typeof User.$inferInsert, 'admin' | 'approvedHost' | 'banned'>>
  ) {
    const query = db
      .update(User)
      .set(user)
      .where(eq(User.id, userId));

    return this.wrap({
      query,
      name: 'Update user'
    });
  }

  public updateOsuUser(
    db: DatabaseClient,
    osuUserId: number,
    user: Partial<Pick<typeof OsuUser.$inferInsert, 'countryCode' | 'username' | 'globalCatchRank' | 'globalManiaRank' | 'globalStdRank' | 'globalTaikoRank' | 'restricted' | 'token'>>
  ) {
    const query = db
      .update(OsuUser)
      .set({
        updatedAt: sql`now()`,
        ...user
      })
      .where(eq(OsuUser.osuUserId, osuUserId));

    return this.wrap({
      query,
      name: 'Update osu! user',
      map: this.map.firstRow
    });
  }

  public updateDiscordUser(
    db: DatabaseClient,
    discordUserId: bigint,
    user: Partial<Pick<typeof DiscordUser.$inferInsert, 'token' | 'username'>>
  ) {
    const query = db
      .update(DiscordUser)
      .set({
        updatedAt: sql`now()`,
        ...user
      })
      .where(eq(DiscordUser.discordUserId, discordUserId));

    return this.wrap({
      query,
      name: 'Update Discord user'
    });
  }

  public getUser(
    db: DatabaseClient,
    userId: number
  ) {
    const query = db
      .select(pick(User, {
        id: true,
        banned: true
      }))
      .from(User)
      .where(eq(User.id, userId))
      .limit(1);

    return this.wrap({
      query,
      name: 'Get user',
      map: this.map.firstRow
    });
  }

  public getOsuUser(
    db: DatabaseClient,
    osuUserId: number
  ) {
    const query = db
      .select(pick(OsuUser, {
        userId: true
      }))
      .from(OsuUser)
      .where(eq(OsuUser.osuUserId, osuUserId))
      .limit(1);
      
    return this.wrap({
      query,
      name: 'Get osu! user',
      map: this.map.firstRowOrNull
    });
  }

  public isUserBanned(
    db: DatabaseClient,
    userId: number
  ) {
    const query = this.utils.exists(
      db,
      User,
      and(eq(User.id, userId), eq(User.banned, true))
    );

    return this.wrap({
      query,
      name: 'Check if user is banned',
      map: this.map.rowExists
    });
  }
}

class UserRepository {
  public db = new UserDbRepository();
}

export const userRepository = new UserRepository();
