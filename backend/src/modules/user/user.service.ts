import { Service } from '$src/utils/service';
import { userRepository } from './user.repository';
import { db } from '$src/singletons';
import type { DatabaseClient } from '$src/types';
import type { Country, DiscordUser, OsuUser, User } from '$src/schema';

export class UserService extends Service {
  @Service.testOnly
  public async createDummyUser(
    db: DatabaseClient,
    n: number,
    options?: {
      admin?: boolean;
      approvedHost?: boolean;
      country?: {
        code: string;
        name: string;
      };
      restricted?: boolean;
      globalStdRank?: number;
    }
  ) {
    const user = await this.createUser({
      admin: options?.admin ?? false,
      approvedHost: options?.approvedHost ?? false
    });
    await this.createCountry(
      db,
      options?.country ?? {
        code: 'US',
        name: 'United States'
      }
    );
    await this.createOsuUser(db, {
      countryCode: options?.country?.code ?? 'US',
      osuUserId: n,
      restricted: options?.restricted ?? false,
      token: {
        accessToken: 'abc',
        refreshToken: 'abc',
        tokenIssuedAt: Date.now()
      },
      userId: user.id,
      username: `osuuser${n}`,
      globalStdRank: options?.globalStdRank
    });
    await this.createDiscordUser(db, {
      discordUserId: BigInt(n),
      token: {
        accessToken: 'abc',
        refreshToken: 'abc',
        tokenIssuedAt: Date.now()
      },
      userId: user.id,
      username: `discorduser${n}`
    });
    return user;
  }

  public async createUser(user: Parameters<typeof userRepository.db.createUser>[1]) {
    return await this.execute(userRepository.db.createUser(db, user));
  }

  public async createCountry(
    db: DatabaseClient,
    country: typeof Country.$inferInsert
  ) {
    return await this.execute(userRepository.db.createCountry(db, country));
  }

  public async createOsuUser(
    db: DatabaseClient,
    osuUser: Pick<typeof OsuUser.$inferInsert, 'globalStdRank' | 'globalCatchRank' | 'globalTaikoRank' | 'globalManiaRank' | 'userId' | 'osuUserId' | 'username' | 'restricted' | 'token' | 'countryCode'>
  ) {
    return await this.execute(userRepository.db.createOsuUser(db, osuUser));
  }

  public async updateUser(
    db: DatabaseClient,
    user: Partial<Pick<typeof User.$inferInsert, 'admin' | 'approvedHost' | 'banned'>>,
    userId: number
  ) {
    return await this.execute(userRepository.db.updateUser(db, user, userId));
  }

  public async updateOsuUser(
    db: DatabaseClient,
    osuUser: Partial<Pick<typeof OsuUser.$inferInsert, 'globalStdRank' | 'globalCatchRank' | 'globalTaikoRank' | 'globalManiaRank' | 'username' | 'restricted' | 'token' | 'countryCode'>>,
    osuUserId: number
  ) {
    return await this.execute(userRepository.db.updateOsuUser(db, osuUser, osuUserId));
  }

  public async updateDiscordUser(
    db: DatabaseClient,
    discordUser: Partial<Pick<typeof DiscordUser.$inferInsert, 'token' | 'username'>>,
    discordUserId: bigint
  ) {
    return await this.execute(userRepository.db.updateDiscordUser(db, discordUser, discordUserId));
  }

  public async createDiscordUser(
    db: DatabaseClient,
    discordUser: Pick<typeof DiscordUser.$inferInsert, 'discordUserId' | 'token' | 'userId' | 'username'>
  ) {
    return await this.execute(userRepository.db.createDiscordUser(db, discordUser));
  }

  public async getUser(userId: number) {
    return await this.execute(userRepository.db.getUser(db, userId));
  }

  public async getOsuUser(osuUserId: number) {
    return await this.execute(userRepository.db.getOsuUser(db, osuUserId));
  }

  public async isUserBanned(db: DatabaseClient, userId: number) {
    return await this.execute(userRepository.db.isUserBanned(db, userId));
  }
}
