import { generateState, OAuth2Tokens } from 'arctic';
import * as v from 'valibot';
import { db } from '$src/singletons';
import { mainDiscordOAuth, osuOAuth } from '$src/singletons/oauth';
import { env } from '$src/utils/env';
import { unknownError } from '$src/utils/error';
import { cookieService } from '../cookie/service';
import { countryService } from '../country/service';
import { discordUserService } from '../discord-user/service';
import { discordService } from '../discord/service';
import { osuBadgeService } from '../osu-badge/service';
import { osuUserAwardedBadgeService } from '../osu-user-awarded-badge/service';
import { osuUserService } from '../osu-user/service';
import { osuService } from '../osu/service';
import { userService } from '../user/service';
import { AuthenticationValidation } from './validation';
import type { Context } from 'hono';
import type { UserBadge } from 'osu-web.js';

function transformArcticToken(
  token: OAuth2Tokens
): v.InferOutput<(typeof AuthenticationValidation)['OAuthToken']> {
  return {
    accessToken: token.accessToken(),
    refreshToken: token.refreshToken(),
    tokenIssuedAt: Date.now()
  };
}

function transformBadge(badge: UserBadge) {
  return {
    description: badge.description,
    imgFileName:
      badge.image_url.match(/https:\/\/assets\.ppy\.sh\/profile-badges\/(.*)/)?.[1] ?? '',
    awardedAt: new Date(badge.awarded_at)
  };
}

async function registerUser(
  osuToken: v.InferOutput<(typeof AuthenticationValidation)['OAuthToken']>,
  discordToken: v.InferOutput<(typeof AuthenticationValidation)['OAuthToken']>
) {
  const osuUser = await osuService.getOsuSelf(osuToken.accessToken);
  const badges = osuUser.badges.map(transformBadge);

  await countryService.createCountry(db, osuUser.country);
  if (badges.length > 0) {
    await osuBadgeService.upsertOsuBadges(db, badges);
  }

  const user = await db.transaction(async (tx) => {
    const isOwner = env.KYOSO_OWNER === osuUser.id;
    const user = await userService.createUser(tx, {
      admin: isOwner,
      approvedHost: isOwner
    });
    await osuUserService.createOsuUser(tx, {
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

    return user;
  });

  if (badges.length > 0) {
    await osuUserAwardedBadgeService.createOsuUserAwardedBadges(db, badges, osuUser.id);
  }

  // NOTE: If a badge has been removed from the user, this case isn't hadled due to the very high unlikelyhood of this happening

  const discordUser = await discordService.getDiscordSelf(discordToken.accessToken);

  await discordUserService.createDiscordUser(db, {
    userId: user.id,
    discordUserId: BigInt(discordUser.id),
    username: discordUser.username,
    token: discordToken
  });

  return user;
}

async function redirectToOsuLogin(c: Context) {
  const state = generateState();
  const url = osuOAuth.createAuthorizationURL(state, ['identify', 'public']);

  cookieService.setOAuthState(c, 'osu', state);
  return c.redirect(url, 302);
}

async function redirectToDiscordLogin(c: Context, generatedState?: string) {
  const state = generatedState ?? generateState();
  const url = mainDiscordOAuth.createAuthorizationURL(state, ['identify']);

  cookieService.setOAuthState(c, 'discord', state);
  return c.redirect(url, 302);
}

async function getIpMetadata(ip: string) {
  if (ip === '127.0.0.1') {
    return {
      city: 'Some City',
      region: 'Some Region',
      country: 'Some Country'
    };
  }

  const info = await fetch(`https://ipinfo.io/${ip}?token=${env.IPINFO_ACCESS_TOKEN}`)
    .then((res) => res.json() as Record<string, any>)
    .catch(unknownError('Failed to get info about IP'));

  const parsed = await v
    .parseAsync(AuthenticationValidation.IpInfoResponse, info)
    .catch(unknownError('Failed to parse info about IP'));
  return parsed;
}

export const authenticationService = {
  transformArcticToken,
  redirectToOsuLogin,
  redirectToDiscordLogin,
  registerUser,
  getIpMetadata
};
