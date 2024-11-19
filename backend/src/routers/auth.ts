import { cookieService } from '$src/modules/cookie/service';
import { osuOAuth } from '$src/singletons/oauth';
import { vValidator } from '@hono/valibot-validator';
import { generateState } from 'arctic';
import { Hono } from 'hono';
import * as v from 'valibot';
import * as s from '$src/utils/validation';
import { HTTPException } from 'hono/http-exception';
import { unknownError } from '$src/utils/error';
import { osuService } from '$src/modules/osu/service';
import { databaseRepository } from '$src/modules/database/repository';
import { db } from '$src/singletons';
import { eq } from 'drizzle-orm';
import { OsuUser } from '$src/schema';
import { authenticationService } from '$src/modules/authentication/service';

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
    const osuUserId = osuService.getOsuUserIdFromAccessToken(tokens.accessToken());

    const userExists = await databaseRepository.exists(db, OsuUser, eq(OsuUser.osuUserId, osuUserId));

    if (userExists) {
      // TODO: get user -> check if banned -> create session -> redirect
    }

    const user = await osuService.getOsuSelf(tokens.accessToken());
    // TODO: create user + osu user -> redirect to Discord AOuth
  }
);

export { authRouter };