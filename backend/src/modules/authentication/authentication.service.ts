import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { OAuth2Tokens } from 'arctic';
import { db } from '$src/singletons';
import { changeAccountDiscordOAuth, mainDiscordOAuth, osuOAuth } from '$src/singletons/oauth';
import { env } from '$src/utils/env';
import { Service } from '$src/utils/service';
import { DiscordService } from '../discord/discord.service';
import { IpInfoService } from '../ipinfo/ipinfo.service';
import { sessionRepository } from '../session/session.repository';
import type { UserBadge } from 'osu-web.js';
import type { User } from '$src/schema';
import { userRepository } from '../user/user.repository';
import type { OAuthToken } from '$src/utils/validation';
import { OsuService } from '../osu/osu.service';
import { osuBadgeRepository } from '../osu-badge/osu-badge.repository';
import { unknownError } from '$src/utils/error';
import { osuRepository } from '../osu/osu.repository';
import { existsSync, unlinkSync } from 'fs';
import { time } from '$src/utils';
import type { GetQueryReturnType } from '../_base/db-repository';
import type { AwaitedReturnType } from '$src/types';

export class AuthenticationService extends Service {
  private TEST_SESSION_TOKEN_PATH = `${process.cwd()}/test-tokens/session.txt`;

  public async createUser(
    osuToken: OAuthToken,
    osuUser: AwaitedReturnType<OsuService['getOsuSelf']>,
    discordToken: OAuthToken,
    discordUser: AwaitedReturnType<DiscordService['getDiscordSelf']>
  ) {
    const badges = osuUser.badges.map(this.transformBadge);
    await this.execute(userRepository.db.createCountry(db, osuUser.country));

    if (badges.length > 0) {
      await this.execute(osuBadgeRepository.db.upsertOsuBadges(db, badges));
    }

    const user = await this.transaction(db, 'Create user', async (tx) => {
      const isOwner = env.KYOSO_OWNER === osuUser.id;
      const user = await this.execute(
        userRepository.db.createUser(tx, {
          admin: isOwner,
          approvedHost: isOwner
        })
      );

      await this.execute(
        userRepository.db.createOsuUser(tx, {
          userId: user.id,
          osuUserId: osuUser.id,
          username: osuUser.username,
          restricted: osuUser.is_restricted,
          globalStdRank: osuUser.statistics_rulesets.osu?.global_rank,
          globalTaikoRank: osuUser.statistics_rulesets.taiko?.global_rank,
          globalCatchRank: osuUser.statistics_rulesets.fruits?.global_rank,
          globalManiaRank: osuUser.statistics_rulesets.mania?.global_rank,
          countryCode: osuUser.country.code,
          token: osuToken
        })
      );

      await this.execute(
        userRepository.db.createDiscordUser(tx, {
          userId: user.id,
          discordUserId: BigInt(discordUser.id),
          username: discordUser.username,
          token: discordToken
        })
      );

      if (badges.length > 0) {
        await this.execute(osuBadgeRepository.db.deleteAllOsuUserAwardedBadges(tx, osuUser.id));
        await this.execute(
          osuBadgeRepository.db.createOsuUserAwardedBadges(tx, badges, osuUser.id)
        );
      }

      return user;
    });

    return user;
  }

  public async createSession(
    userId: number,
    ipAddress: string,
    ipMetadata: AwaitedReturnType<IpInfoService['getIpMetadata']>,
    userAgent: string | null
  ) {
    const token = this.generateSessionToken();
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

    await this.execute(
      sessionRepository.db.createSession(db, {
        ipMetadata,
        userId,
        ipAddress,
        id: sessionId,
        userAgent: env.NODE_ENV !== 'production' ? 'test' : userAgent
      })
    );
    return token;
  }

  @Service.testOnly
  public async createTestSession(userId: number) {
    const sessionToken = await this.createSession(
      userId,
      '127.0.0.1',
      {
        city: 'Test',
        country: 'Test',
        region: 'Test'
      },
      null
    );
    await Bun.write(this.TEST_SESSION_TOKEN_PATH, sessionToken);
  }

  public async updateUser(
    userId: number,
    user: Partial<Pick<typeof User.$inferInsert, 'admin' | 'approvedHost' | 'banned'>>
  ) {
    return await this.execute(userRepository.db.updateUser(db, userId, user));
  }

  public async updateOsuApiData(osuUser: AwaitedReturnType<OsuService['getOsuSelf']>) {
    const badges = osuUser.badges.map(this.transformBadge);
    await this.execute(userRepository.db.createCountry(db, osuUser.country));

    if (badges.length > 0) {
      await this.execute(osuBadgeRepository.db.upsertOsuBadges(db, badges));

      await this.transaction(db, 'Update user badges', async (tx) => {
        await this.execute(osuBadgeRepository.db.deleteAllOsuUserAwardedBadges(tx, osuUser.id));
        await this.execute(
          osuBadgeRepository.db.createOsuUserAwardedBadges(tx, badges, osuUser.id)
        );
      });
    }

    await this.execute(
      userRepository.db.updateOsuUser(db, osuUser.id, {
        username: osuUser.username,
        restricted: osuUser.is_restricted,
        globalStdRank: osuUser.statistics_rulesets.osu?.global_rank,
        globalTaikoRank: osuUser.statistics_rulesets.taiko?.global_rank,
        globalCatchRank: osuUser.statistics_rulesets.fruits?.global_rank,
        globalManiaRank: osuUser.statistics_rulesets.mania?.global_rank,
        countryCode: osuUser.country.code
      })
    );
  }

  public async updateDiscordApiData(
    discordUser: AwaitedReturnType<DiscordService['getDiscordSelf']>
  ) {
    await this.execute(
      userRepository.db.updateDiscordUser(db, BigInt(discordUser.id), {
        username: discordUser.username
      })
    );
  }

  public async getOsuTokens(code: string) {
    const tokens = await osuOAuth
      .validateAuthorizationCode(code)
      .catch(unknownError('Failed to validate osu! authorization code'));

    return this.transformArcticToken(tokens);
  }

  public async getMainDiscordTokens(code: string) {
    const tokens = await mainDiscordOAuth
      .validateAuthorizationCode(code)
      .catch(unknownError('Failed to validate Discord (main client) authorization code'));

    return this.transformArcticToken(tokens);
  }

  public async getChangeAccountDiscordTokens(code: string) {
    const tokens = await changeAccountDiscordOAuth
      .validateAuthorizationCode(code)
      .catch(unknownError('Failed to validate Discord (change account client) authorization code'));

    return this.transformArcticToken(tokens);
  }

  public getOsuUserIdFromAccessToken(accessToken: string) {
    const payloadString = accessToken.substring(
      accessToken.indexOf('.') + 1,
      accessToken.lastIndexOf('.')
    );
    const payloadBuffer = Buffer.from(payloadString, 'base64').toString('ascii');
    const payload: { sub: string } = JSON.parse(payloadBuffer);
    const osuUserId = Number(payload.sub);
    return osuUserId;
  }

  public transformArcticToken(token: OAuth2Tokens): OAuthToken {
    return {
      accessToken: token.accessToken(),
      refreshToken: token.refreshToken(),
      tokenIssuedAt: Date.now()
    };
  }

  /** osu! tokens last 1 day */
  public shouldRefreshOsuToken(issuedAt: number) {
    return Date.now() >= new Date(issuedAt).getTime() + time.days(1);
  }

  /** Discord tokens last 7 days */
  public shouldRefreshDiscordToken(issuedAt: number) {
    return Date.now() >= new Date(issuedAt).getTime() + time.days(7);
  }

  public async refreshOsuToken(osuUserId: number, refreshToken: string) {
    const newOsuTokens = await osuOAuth.refreshAccessToken(refreshToken);
    await this.execute(
      userRepository.db.updateOsuUser(db, osuUserId, {
        token: this.transformArcticToken(newOsuTokens)
      })
    );
    return this.transformArcticToken(newOsuTokens);
  }

  public async refreshDiscordToken(discordUserId: bigint, refreshToken: string) {
    const newDiscordTokens = await mainDiscordOAuth.refreshAccessToken(refreshToken);
    await this.execute(
      userRepository.db.updateDiscordUser(db, discordUserId, {
        token: this.transformArcticToken(newDiscordTokens)
      })
    );
    return this.transformArcticToken(newDiscordTokens);
  }

  public transformBadge(badge: UserBadge) {
    return {
      description: badge.description,
      imgFileName:
        badge.image_url.match(/https:\/\/assets\.ppy\.sh\/profile-badges\/(.*)/)?.[1] ?? '',
      awardedAt: new Date(badge.awarded_at)
    };
  }

  public async setTempOsuTokens(state: string, tokens: OAuthToken) {
    await this.execute(osuRepository.kv.setTempOsuTokens(state, tokens));
  }

  public async getTempOsuTokens(state: string) {
    return await this.execute(osuRepository.kv.getTempOsuTokens(state));
  }

  public async deleteTempOsuTokens(state: string) {
    return await this.execute(osuRepository.kv.deleteTempOsuTokens(state));
  }

  private generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
  }

  @Service.testOnly
  public async getTestSessionToken() {
    return await Bun.file(this.TEST_SESSION_TOKEN_PATH).text();
  }

  public async deleteSession(sessionToken: string) {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));

    await this.execute(sessionRepository.db.deleteSession(db, sessionId));
    if (env.NODE_ENV === 'test' && this.tokenFileExists()) {
      unlinkSync(this.TEST_SESSION_TOKEN_PATH);
    }
  }

  public tokenFileExists() {
    return existsSync(this.TEST_SESSION_TOKEN_PATH);
  }

  public async getSession(sessionToken: string) {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));
    const session = await this.execute(sessionRepository.db.getSession(db, sessionId));
    return session;
  }

  public hasSessionExpired(
    session: NonNullable<GetQueryReturnType<typeof sessionRepository.db.getSession>>
  ) {
    return Date.now() >= session.expiresAt.getTime();
  }

  public osuApiDataNeedsUpdate(
    session: NonNullable<GetQueryReturnType<typeof sessionRepository.db.getSession>>
  ) {
    return Date.now() >= session.osu.updatedAt.getTime() + time.days(1);
  }

  public discordApiDataNeedsUpdate(
    session: NonNullable<GetQueryReturnType<typeof sessionRepository.db.getSession>>
  ) {
    return Date.now() >= session.discord.updatedAt.getTime() + time.days(1);
  }

  public sessionExpirationNeedsReset(
    session: NonNullable<GetQueryReturnType<typeof sessionRepository.db.getSession>>
  ) {
    return Date.now() >= session.expiresAt.getTime() - time.days(10);
  }

  public async resetSessionExpiration(sessionToken: string) {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));
    await this.execute(sessionRepository.db.resetExpiration(db, sessionId));
  }
}
