import { cookieService } from '$src/modules/cookie/service';
import { mainDiscordOAuth, osuOAuth } from '$src/singletons/oauth';
import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import * as v from 'valibot';
import * as s from '$src/utils/validation';
import { HTTPException } from 'hono/http-exception';
import { unknownError } from '$src/utils/error';
import { osuService } from '$src/modules/osu/service';
import { databaseRepository } from '$src/modules/database/repository';
import { db, redis } from '$src/singletons';
import { eq } from 'drizzle-orm';
import { OsuUser } from '$src/schema';
import { authenticationService } from '$src/modules/authentication/service';
import { osuRepository } from '$src/modules/osu/repository';
import { generateState } from 'arctic';
import { getConnInfo } from 'hono/bun';
import { sessionService } from '$src/modules/session/service';

const authRouter = new Hono().basePath('/auth');

authRouter.get('/login', async (c) => {
  return await authenticationService.redirectToOsuLogin(c);
});

authRouter.get(
  '/callback/osu',
  vValidator(
    'query',
    v.object({
      code: s.nonEmptyString(),
      state: s.nonEmptyString()
    })
  ),
  async (c) => {
    const { code, state } = c.req.valid('query');
    const storedState = cookieService.getOAuthState(c, 'osu');

    if (state !== storedState) {
      throw new HTTPException(400, {
        message: 'State doesn\'t match'
      });
    }

    const tokens = await osuOAuth.validateAuthorizationCode(code).catch(unknownError('Failed to validate authorization code'));
    const accessToken = tokens.accessToken();
    const osuUserId = osuService.getOsuUserIdFromAccessToken(accessToken);
    const userExists = await databaseRepository.exists(db, OsuUser, eq(OsuUser.osuUserId, osuUserId));

    if (userExists) {
      // TODO: get user -> check if banned -> create session -> redirect
    }

    const newState = generateState();
    await osuRepository.temporarilyStoreTokens(redis, authenticationService.transformArcticToken(tokens), newState, 300_000 /* 5 minutes */);

    return await authenticationService.redirectToDiscordLogin(c, newState);
  }
);

authRouter.get(
  '/callback/discord',
  vValidator(
    'query',
    v.object({
      code: s.nonEmptyString(),
      state: s.nonEmptyString()
    })
  ),
  async (c) => {
    const { code, state } = c.req.valid('query');
    const storedState = cookieService.getOAuthState(c, 'discord');

    if (state !== storedState) {
      throw new HTTPException(400, {
        message: 'State doesn\'t match'
      });
    }

    const discordTokens = await mainDiscordOAuth.validateAuthorizationCode(code).catch(unknownError('Failed to validate authorization code'));
    const osuTokens = await osuService.getTemporarilyStoredTokens(redis, state);

    if (osuTokens === null) {
      throw new HTTPException(400, {
        message: 'Log into osu! first'
      });
    }
    
    await osuService.deleteTemporarilyStoredTokens(redis, state);
    const user = await authenticationService.registerUser(osuTokens, authenticationService.transformArcticToken(discordTokens));

    const ip = getConnInfo(c).remote.address ?? '127.0.0.1';
    const ipMetadata = await authenticationService.getIpMetadata(ip);
    await sessionService.createSession(db, {
      ipMetadata,
      ipAddress: ip,
      userAgent: c.req.header('user-agent'),
      userId: user.id
    });

    return c.redirect('/');
  }
);

export { authRouter };