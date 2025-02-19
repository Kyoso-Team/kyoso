import { existsSync, unlinkSync } from 'fs';
import { vValidator } from '@hono/valibot-validator';
import { generateState } from 'arctic';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as v from 'valibot';
import { authenticationService } from '$src/modules/authentication/service';
import { cookieService } from '$src/modules/cookie/service';
import { entityRepository } from '$src/modules/entity/repository';
import { osuRepository } from '$src/modules/osu/repository';
import { osuService } from '$src/modules/osu/service';
import { userRepository } from '$src/modules/user/repository';
import { User } from '$src/schema';
import { db, redis } from '$src/singletons';
import { mainDiscordOAuth, osuOAuth } from '$src/singletons/oauth';
import { env } from '$src/utils/env';
import { unknownError } from '$src/utils/error';
import * as s from '$src/utils/validation';

const sessionPath = `${process.cwd()}/test-tokens/session.txt`;

const authRouter = new Hono()
  .basePath('/auth')
  .get(
    '/login',
    vValidator(
      'query',
      v.object({
        redirect_path: v.optional(s.nonEmptyString())
      })
    ),
    async (c) => {
      const { redirect_path } = c.req.valid('query');
      if (redirect_path) {
        cookieService.setRedirectPath(c, redirect_path);
      }

      return await authenticationService.redirectToOsuLogin(c);
    }
  )
  .get(
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
          message: "State doesn't match"
        });
      }

      const tokens = await osuOAuth
        .validateAuthorizationCode(code)
        .catch(unknownError('Failed to validate osu! authorization code'));
      const accessToken = tokens.accessToken();
      const osuUserId = osuService.getOsuUserIdFromAccessToken(accessToken);
      const osuUser = await userRepository.getOsuUser(db, osuUserId, {
        userId: true
      });

      if (osuUser) {
        const banned = await entityRepository.exists(
          db,
          User,
          and(eq(User.id, osuUser.userId), eq(User.banned, true))
        );

        if (banned) {
          throw new HTTPException(403, {
            message: 'You are banned from using this service'
          });
        }

        await authenticationService.createSession(c, db, osuUser.userId);

        const redirectPath = cookieService.getRedirectPath(c);
        cookieService.deleteRedirectPath(c);
        return c.redirect(`${env.FRONTEND_URL}${redirectPath ?? '/'}`, 302);
      }

      const newState = generateState();
      await osuRepository.temporarilyStoreTokens(
        redis,
        authenticationService.transformArcticToken(tokens),
        newState,
        300_000 /* 5 minutes */
      );

      return await authenticationService.redirectToDiscordLogin(c, newState);
    }
  )
  .get(
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
          message: "State doesn't match"
        });
      }

      const unparsedDiscordTokens = await mainDiscordOAuth
        .validateAuthorizationCode(code)
        .catch(unknownError('Failed to validate Discord authorization code'));
      const osuTokens = await osuService.getTemporarilyStoredTokens(redis, state);

      if (osuTokens === null) {
        throw new HTTPException(400, {
          message: 'Log into osu! first'
        });
      }

      await osuService.deleteTemporarilyStoredTokens(redis, state);
      const discordTokens = authenticationService.transformArcticToken(unparsedDiscordTokens);

      // Necessary for test environment
      if (env.NODE_ENV !== 'production') {
        await Bun.write(`${process.cwd()}/test-tokens/discord.json`, JSON.stringify(discordTokens));
        await Bun.write(`${process.cwd()}/test-tokens/osu.json`, JSON.stringify(osuTokens));
      }

      const user = await authenticationService.registerUser(osuTokens, discordTokens);

      await authenticationService.createSession(c, db, user.id);

      const redirectPath = cookieService.getRedirectPath(c);
      cookieService.deleteRedirectPath(c);
      return c.redirect(`${env.FRONTEND_URL}${redirectPath ?? '/'}`, 302);
    }
  )
  .get(
    '/logout',
    vValidator(
      'query',
      v.object({
        redirect_path: v.optional(s.nonEmptyString())
      })
    ),
    async (c) => {
      const { redirect_path } = c.req.valid('query');
      await authenticationService.deleteSession(c, db);
      return c.redirect(`${env.FRONTEND_URL}${redirect_path ?? '/'}`, 302);
    }
  )
  .get('/session', async (c) => {
    const session = await authenticationService.validateSession(c, db, {
      user: {
        id: true,
        osu: {
          osuUserId: true,
          username: true
        },
        discord: {
          discordUserId: true,
          username: true
        }
      }
    });

    return c.json(
      session
        ? {
            id: session.id,
            user: session.user,
            osu: session.osu,
            discord: {
              id: session.discord.discordUserId.toString(),
              username: session.discord.username
            }
          }
        : null
    );
  })
  .post('/login/test', vValidator('json', v.object({ userId: v.number() })), async (c) => {
    if (env.NODE_ENV === 'production') {
      throw new HTTPException(403, {
        message: 'Not allowed in production'
      });
    }

    const sessionExists = existsSync(sessionPath);
    if (sessionExists) {
      await authenticationService.deleteSession(c, db);
    }

    const body = c.req.valid('json');
    const sessionToken = await authenticationService.createSession(c, db, body.userId);
    await Bun.write(sessionPath, sessionToken);
    return c.json(null);
  })
  .post('/logout/test', async (c) => {
    if (env.NODE_ENV === 'production') {
      throw new HTTPException(403, {
        message: 'Not allowed in production'
      });
    }

    await authenticationService.deleteSession(c, db);
    unlinkSync(sessionPath);
    return c.json(null);
  });

export { authRouter };
