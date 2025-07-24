import { db } from '$src/singletons';
import { Service } from '$src/utils/service';
import { userRepository } from './user.repository';
import type { DiscordUser, OsuUser, User } from '$src/schema';
import type { DatabaseClient } from '$src/types';

export class UserService extends Service {
  // TODO: Move this to AuthenticationService
  // @Service.testOnly
  // public async createDummyUser(
  //   db: DatabaseClient,
  //   n: number,
  //   options?: {
  //     admin?: boolean;
  //     approvedHost?: boolean;
  //     country?: {
  //       code: string;
  //       name: string;
  //     };
  //     restricted?: boolean;
  //     globalStdRank?: number;
  //   }
  // ) {
  //   const user = await this.createUser({
  //     admin: options?.admin ?? false,
  //     approvedHost: options?.approvedHost ?? false
  //   });
  //   await this.createCountry(
  //     db,
  //     options?.country ?? {
  //       code: 'US',
  //       name: 'United States'
  //     }
  //   );
  //   await this.createOsuUser(db, {
  //     countryCode: options?.country?.code ?? 'US',
  //     osuUserId: n,
  //     restricted: options?.restricted ?? false,
  //     token: {
  //       accessToken: 'abc',
  //       refreshToken: 'abc',
  //       tokenIssuedAt: Date.now()
  //     },
  //     userId: user.id,
  //     username: `osuuser${n}`,
  //     globalStdRank: options?.globalStdRank
  //   });
  //   await this.createDiscordUser(db, {
  //     discordUserId: BigInt(n),
  //     token: {
  //       accessToken: 'abc',
  //       refreshToken: 'abc',
  //       tokenIssuedAt: Date.now()
  //     },
  //     userId: user.id,
  //     username: `discorduser${n}`
  //   });
  //   return user;
  // }

  public async createOsuUser(
    db: DatabaseClient,
    osuUser: Pick<
      typeof OsuUser.$inferInsert,
      | 'globalStdRank'
      | 'globalCatchRank'
      | 'globalTaikoRank'
      | 'globalManiaRank'
      | 'userId'
      | 'osuUserId'
      | 'username'
      | 'restricted'
      | 'token'
      | 'countryCode'
    >
  ) {
    return await this.execute(userRepository.db.createOsuUser(db, osuUser));
  }

  public async updateUser(
    db: DatabaseClient,
    user: Partial<Pick<typeof User.$inferInsert, 'admin' | 'approvedHost' | 'banned'>>,
    userId: number
  ) {
    return await this.execute(userRepository.db.updateUser(db, userId, user));
  }

  public async createDiscordUser(
    db: DatabaseClient,
    discordUser: Pick<
      typeof DiscordUser.$inferInsert,
      'discordUserId' | 'token' | 'userId' | 'username'
    >
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
