import type { Context } from 'hono';
import { osuService } from '../osu/service';
import { generateState } from 'arctic';
import { mainDiscordOAuth, osuOAuth } from '$src/singletons/oauth';
import { cookieService } from '../cookie/service';
import { countryService } from '../country/service';
import { db } from '$src/singletons';
import { userService } from '../user/service';

async function registerUser(osuAccesstoken: string) {
  const osuUser = await osuService.getOsuSelf(osuAccesstoken);

  await db.transaction(async (tx) => {
    const user = await userService.createUser(tx, { osuUserId: osuUser.id });
    await countryService.createCountry(tx, osuUser.country);
  });
}

async function redirectToOsuLogin(c: Context) {
  const state = generateState();
	const url = osuOAuth.createAuthorizationURL(state, ['identify', 'public']);

  cookieService.setOAuthState(c, 'osu', state);
  return c.redirect(url, 302);
}

async function redirectToDiscordLogin(c: Context) {
  const state = generateState();
  const url = mainDiscordOAuth.createAuthorizationURL(state, ['identify']);

  cookieService.setOAuthState(c, 'discord', state);
  return c.redirect(url, 302);
}

export const authenticationService = { redirectToOsuLogin, redirectToDiscordLogin };