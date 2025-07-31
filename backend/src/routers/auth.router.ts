import { generateState } from 'arctic';
import { status } from 'elysia';
import { HTTPException } from 'hono/http-exception';
import { AuthenticationService } from '$src/modules/authentication/authentication.service';
import { CookieService } from '$src/modules/cookie/cookie.service';
import { DiscordService } from '$src/modules/discord/discord.service';
import { IpInfoService } from '$src/modules/ipinfo/ipinfo.service';
import { OsuService } from '$src/modules/osu/osu.service';
import { UserService } from '$src/modules/user/user.service';
import { db } from '$src/singletons';
import { mainDiscordOAuth, osuOAuth } from '$src/singletons/oauth';
import { env } from '$src/utils/env';
import { initServices, t } from './_base/common';
import { createRouter } from './_base/router';

export const authRouter = createRouter({
  prefix: '/auth'
})
  .use(initServices({
    authenticationService: AuthenticationService,
    cookieService: CookieService,
    ipInfoService: IpInfoService,
    osuService: OsuService,
    discordService: DiscordService,
    userService: UserService
  }))
  .get(
    '/login',
    ({ cookie, query, redirect, cookieService }) => {
      if (query.redirect_path) {
        cookieService.setRedirectPath(cookie, query.redirect_path);
      }

      const state = generateState();
      const url = osuOAuth.createAuthorizationURL(state, ['identify', 'public']);

      cookieService.setOAuthState(cookie, 'osu', state);
      return redirect(`${url.toString()}&prompt=consent`, 302);
    },
    {
      query: t.Object({
        redirect_path: t.Optional(t.String())
      })
    }
  )
  .post(
    '/login/test',
    async ({ body, sessionToken, authenticationService }) => {
      if (sessionToken) {
        await authenticationService.deleteSession(sessionToken);
      }

      await authenticationService.createTestSession(body.userId);
    },
    {
      body: t.Object({
        userId: t.IntegerId()
      }),
      testOnly: true
    }
  )
  .group('/callback', (app) =>
    app
      .guard({
        schema: 'standalone',
        query: t.Object({
          code: t.String(),
          state: t.String()
        }),
        cookie: t.Cookie({
          osu_oauth_state: t.String(),
          discord_oauth_state: t.String()
        })
      })
      .onBeforeHandle(({ cookie, query, cookieService, path }) => {
        const storedState = cookieService.getOAuthState(
          cookie,
          path.split('/').at(-1) as 'osu' | 'discord'
        );
        if (query.state !== storedState) {
          throw new HTTPException(400, {
            message: "States don't match"
          });
        }
      })
      .derive(({ server, request }) => ({
        ipAddress: env.NODE_ENV === 'test' ? '127.0.0.1' : server!.requestIP(request)!.address
      }))
      .get(
        '/osu',
        async ({
          query,
          cookie,
          redirect,
          headers,
          ipAddress,
          authenticationService,
          ipInfoService,
          cookieService,
          userService
        }) => {
          const osuTokens = await authenticationService.getOsuTokens(query.code);
          const osuUserId = authenticationService.getOsuUserIdFromAccessToken(
            osuTokens.accessToken
          );
          const osuUser = await userService.getOsuUser(osuUserId);

          if (osuUser) {
            const banned = await userService.isUserBanned(db, osuUser.userId);
            if (banned) {
              return status(403, 'You are banned from using this service');
            }

            const ipMetadata = await ipInfoService.getIpMetadata(ipAddress);
            const sessionToken = await authenticationService.createSession(
              osuUser.userId,
              ipAddress,
              ipMetadata,
              headers['user-agent'] ?? null
            );
            cookieService.setSession(cookie, sessionToken);

            const redirectPath = cookieService.getRedirectPath(cookie);
            cookieService.deleteRedirectPath(cookie);
            return redirect(`${env.FRONTEND_URL}${redirectPath ?? '/'}`, 302);
          }

          const newState = generateState();
          await authenticationService.setTempOsuTokens(newState, osuTokens);

          const url = mainDiscordOAuth.createAuthorizationURL(newState, ['identify']);

          cookieService.setOAuthState(cookie, 'discord', newState);
          return redirect(`${url}&prompt=consent`, 302);
        }
      )
      .get(
        '/discord',
        async ({
          query,
          cookie,
          headers,
          redirect,
          ipAddress,
          authenticationService,
          cookieService,
          ipInfoService,
          osuService,
          discordService
        }) => {
          const state = cookieService.getOAuthState(cookie, 'discord') ?? '';
          const osuTokens = await authenticationService.getTempOsuTokens(state);
          await authenticationService.deleteTempOsuTokens(state);

          if (osuTokens === null) {
            return status(401, 'Log into osu! first');
          }

          const discordTokens = await authenticationService.getMainDiscordTokens(query.code);

          // Necessary for test environment
          if (env.NODE_ENV === 'test') {
            await Bun.write(
              `${process.cwd()}/test-tokens/discord.json`,
              JSON.stringify(discordTokens)
            );
            await Bun.write(`${process.cwd()}/test-tokens/osu.json`, JSON.stringify(osuTokens));
          }

          const osuUser = await osuService.getOsuSelf(osuTokens.accessToken);
          const discordUser = await discordService.getDiscordSelf(discordTokens.accessToken);
          const user = await authenticationService.createUser(
            osuTokens,
            osuUser,
            discordTokens,
            discordUser
          );

          const ipMetadata = await ipInfoService.getIpMetadata(ipAddress);
          await authenticationService.createSession(
            user.id,
            ipAddress,
            ipMetadata,
            headers['user-agent'] ?? null
          );

          const redirectPath = cookieService.getRedirectPath(cookie);
          cookieService.deleteRedirectPath(cookie);
          return redirect(`${env.FRONTEND_URL}${redirectPath ?? '/'}`, 302);
        }
      )
      .get(
        '/discord/change',
        async ({ query, redirect, authenticationService, discordService }) => {
          const discordTokens = await authenticationService.getChangeAccountDiscordTokens(
            query.code
          );
          const discordUser = await discordService.getDiscordSelf(discordTokens.accessToken);
          await authenticationService.updateDiscordApiData(discordUser);
          return redirect(`${env.FRONTEND_URL}${query.redirect_path ?? '/'}`, 302);
        },
        {
          query: t.Object({
            redirect_path: t.Optional(t.String())
          })
        }
      )
  )
  .get(
    '/logout',
    async ({ query, cookie, redirect, authenticationService, cookieService }) => {
      const sessionToken =
        env.NODE_ENV === 'test'
          ? await authenticationService.getTestSessionToken()
          : cookieService.getSession(cookie);
      if (!sessionToken) {
        return status(401, 'Not logged in');
      }

      await authenticationService.deleteSession(sessionToken);
      return redirect(`${env.FRONTEND_URL}${query.redirect_path ?? '/'}`, 302);
    },
    {
      query: t.Object({
        redirect_path: t.Optional(t.String())
      })
    }
  )
  .get(
    '/session',
    async ({ session }) => {
      return {
        id: session.id,
        user: {
          id: session.user.id,
          admin: session.user.admin,
          approvedHost: session.user.approvedHost
        },
        osu: {
          osuUserId: session.osu.osuUserId,
          username: session.osu.username
        },
        discord: {
          discordUserId: session.discord.discordUserId.toString(),
          username: session.discord.username
        }
      };
    },
    {
      session: true
    }
  );
