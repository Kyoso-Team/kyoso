import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { generateState, OAuth2Tokens } from 'arctic';
import { getConnInfo } from 'hono/bun';
import { HTTPException } from 'hono/http-exception';
import { db } from '$src/singletons';
import { mainDiscordOAuth, osuOAuth } from '$src/singletons/oauth';
import { env } from '$src/utils/env';
import { Service } from '$src/utils/service';
import { cookieService } from '../cookie/service';
import { discordService } from '../discord/service';
import { ipInfoService } from '../ipinfo/service';
import { osuBadgeService } from '../osu-badge/service';
import { osuService } from '../osu/service';
import { sessionRepository } from '../session/repository';
import { SessionValidation } from '../session/validation';
import { userService } from '../user/service';
import type { Context } from 'hono';
import type { UserBadge } from 'osu-web.js';
import type { Session } from '$src/schema';
import type { DatabaseClient } from '$src/types';
import type { SessionSelection } from '../session/types';
import type { AuthenticationValidationInput, AuthenticationValidationOutput } from './validation';

class AuthenticationService extends Service {
  public transformArcticToken(token: OAuth2Tokens): AuthenticationValidationOutput['OAuthToken'] {
    return {
      accessToken: token.accessToken(),
      refreshToken: token.refreshToken(),
      tokenIssuedAt: Date.now()
    };
  }

  private transformBadge(badge: UserBadge) {
    return {
      description: badge.description,
      imgFileName:
        badge.image_url.match(/https:\/\/assets\.ppy\.sh\/profile-badges\/(.*)/)?.[1] ?? '',
      awardedAt: new Date(badge.awarded_at)
    };
  }

  public async registerUser(
    osuToken: AuthenticationValidationInput['OAuthToken'],
    discordToken: AuthenticationValidationInput['OAuthToken']
  ) {
    const osuUser = await osuService.getOsuSelf(osuToken.accessToken);
    const discordUser = await discordService.getDiscordSelf(discordToken.accessToken);
    const badges = osuUser.badges.map(this.transformBadge);

    await userService.createCountry(db, osuUser.country);
    if (badges.length > 0) {
      await osuBadgeService.upsertOsuBadges(db, badges);
    }

    const user = await db.transaction(async (tx) => {
      const isOwner = env.KYOSO_OWNER === osuUser.id;
      const user = await userService.createUser(tx, {
        admin: isOwner,
        approvedHost: isOwner
      });
      await userService.createOsuUser(tx, {
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
      });

      await userService.createDiscordUser(tx, {
        userId: user.id,
        discordUserId: BigInt(discordUser.id),
        username: discordUser.username,
        token: discordToken
      });

      return user;
    });

    if (badges.length > 0) {
      await osuBadgeService.createOsuUserAwardedBadges(db, badges, osuUser.id);
    }

    // NOTE: If a badge has been removed from the user, this case isn't hadled due to the very high unlikelyhood of this happening
    return user;
  }

  public async redirectToOsuLogin(c: Context) {
    const state = generateState();
    const url = osuOAuth.createAuthorizationURL(state, ['identify', 'public']);

    cookieService.setOAuthState(c, 'osu', state);
    return c.redirect(`${url}&prompt=consent`, 302);
  }

  public async redirectToDiscordLogin(c: Context, generatedState?: string) {
    const state = generatedState ?? generateState();
    const url = mainDiscordOAuth.createAuthorizationURL(state, ['identify']);

    cookieService.setOAuthState(c, 'discord', state);
    return c.redirect(`${url}&prompt=consent`, 302);
  }

  private generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
  }

  public async createSession(c: Context, db: DatabaseClient, userId: number) {
    const fn = this.createServiceFunction('Failed to create session');
    const token = this.generateSessionToken();
    const ip = getConnInfo(c).remote.address ?? '127.0.0.1';
    const ipMetadata = await ipInfoService.getIpMetadata(ip);
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

    const session = await fn.validate(SessionValidation.CreateSession, 'session', {
      ipMetadata,
      userId,
      id: sessionId,
      ipAddress: ip,
      userAgent: c.req.header('user-agent')
    });
    await fn.handleDbQuery(sessionRepository.createSession(db, session));
    cookieService.setSession(c, token);
    return token;
  }

  public async deleteSession(c: Context, db: DatabaseClient) {
    const token = cookieService.getSession(c);
    if (!token) {
      throw new HTTPException(403, {
        message: 'Not logged in'
      });
    }

    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    await sessionRepository.deleteSession(db, sessionId);
    cookieService.deleteSession(c);
  }

  public async validateSession<T extends Omit<SessionSelection, 'id' | 'expiresAt'>>(
    c: Context,
    db: DatabaseClient,
    select: T
  ) {
    const token = cookieService.getSession(c);
    if (!token) {
      return undefined;
    }

    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const session = await sessionRepository.getSession(db, sessionId, {
      id: true,
      expiresAt: true,
      ...select
    });

    if (!session && token) {
      cookieService.deleteSession(c);
      return undefined;
    }

    if (
      session &&
      Date.now() >= (session as (typeof Session)['$inferSelect']).expiresAt.getTime()
    ) {
      await sessionRepository.deleteSession(db, sessionId);
      cookieService.deleteSession(c);
      return undefined;
    } else if (
      session &&
      Date.now() >=
        (session as (typeof Session)['$inferSelect']).expiresAt.getTime() -
          864_000_000 /* 10 days */
    ) {
      await sessionRepository.resetExpiresAt(db, sessionId);
      cookieService.setSession(c, token);
    }

    return session;
  }
}

export const authenticationService = new AuthenticationService();
