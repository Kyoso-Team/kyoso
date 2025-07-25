import Elysia, { status, t as t1 } from 'elysia';
import { AuthenticationService } from '$src/modules/authentication/authentication.service';
import { CookieService } from '$src/modules/cookie/cookie.service';
import { env } from '$src/utils/env';
import { OsuService } from '$src/modules/osu/osu.service';
import { DiscordService } from '$src/modules/discord/discord.service';

export const t = {
  ...t1,
  IntegerId: () =>
    t1.Integer({
      minimum: 0
    })
};

type ElysiaConfig = {
  name?: string;
  prefix?: string;
};

export const elysia = <TServices extends Record<string, any> = {}>(
  config: ElysiaConfig & {
    services?: TServices;
  }
) =>
  new Elysia(config)
    .onRequest(({ set }) => {
      set.headers['x-request-id'] = Bun.randomUUIDv7();
    })
    .derive({ as: 'global' }, ({ set }) => {
      return {
        requestId: set.headers['x-request-id']!,
        forceOsuApiDataUpdate: false,
        forceDiscordApiDataUpdate: false
      };
    })
    // Initialize services
    .resolve(({ requestId }) => {
      const mapped: Record<string, any> = {};

      if (config.services) {
        for (const [key, ServiceClass] of Object.entries(config.services)) {
          mapped[key] = new ServiceClass('request', requestId);
        }
      }

      return mapped as { [K in keyof TServices]: InstanceType<TServices[K]> };
    })
    // Handle session
    .resolve(async ({ cookie, requestId, forceOsuApiDataUpdate, forceDiscordApiDataUpdate }) => {
      const authenticationService = new AuthenticationService('request', requestId);
      const cookieService = new CookieService('request', requestId);
      const osuService = new OsuService('request', requestId);
      const discordService = new DiscordService('request', requestId);

      const sessionToken =
        env.NODE_ENV === 'test' && authenticationService.tokenFileExists()
          ? await authenticationService.getTestSessionToken()
          : cookieService.getSession(cookie);
      let session = sessionToken ? await authenticationService.getSession(sessionToken) : null;

      if (session && sessionToken) {
        if (authenticationService.hasSessionExpired(session) || session.user.banned) {
          await authenticationService.deleteSession(sessionToken);
          cookieService.deleteSession(cookie);

          return session.user.banned ? status(403, 'You are banned from using this service') : { session: null, sessionToken: undefined };
        } else if (authenticationService.sessionExpirationNeedsReset(session)) {
          await authenticationService.resetSessionExpiration(sessionToken);
        }

        let refreshUser = false;
        if (authenticationService.osuApiDataNeedsUpdate(session) || forceOsuApiDataUpdate) {
          const token = authenticationService.shouldRefreshOsuToken(session.osu.token.tokenIssuedAt)
            ? await authenticationService.refreshOsuToken(session.osu.osuUserId, session.osu.token.refreshToken)
            : session.osu.token;
            
          const osuUser = await osuService.getOsuSelf(token.accessToken);
          await authenticationService.updateOsuApiData(osuUser);
          refreshUser = true;
        }

        if (authenticationService.discordApiDataNeedsUpdate(session) || forceDiscordApiDataUpdate) {
          const token = authenticationService.shouldRefreshDiscordToken(session.discord.token.tokenIssuedAt)
            ? await authenticationService.refreshDiscordToken(session.discord.discordUserId, session.discord.token.refreshToken)
            : session.discord.token;

          const discordUser = await discordService.getDiscordSelf(token.accessToken);
          await authenticationService.updateDiscordApiData(discordUser);
          refreshUser = true;
        }

        if (refreshUser) {
          session = await authenticationService.getSession(sessionToken);
        }
      }

      return { session, sessionToken };
    })
    // Transform query parameters to undefined if they are 'undefined' string
    .onTransform(({ query }) => {
      for (const key in query) {
        if (query[key] === 'undefined') {
          query[key] = undefined as any;
        }
      }
    })
    .macro({
      testOnly: {
        beforeHandle: () => {
          if (env.NODE_ENV !== 'test') {
            return status(403, 'This endpoint is only available in test environment');
          }
        }
      },
      devOnly: {
        beforeHandle: () => {
          if (env.NODE_ENV !== 'development') {
            return status(403, 'This endpoint is only available in development environment');
          }
        }
      },
      session: (
        v:
          | true
          | {
              admin?: true;
              approvedHost?: true;
              forceOsuApiDataUpdate?: true;
              forceDiscordApiDataUpdate?: true;
            }
      ) => ({
        derive: () => {
          if (typeof v !== 'object') return {};

          return {
            forceOsuApiDataUpdate: v.forceOsuApiDataUpdate,
            forceDiscordApiDataUpdate: v.forceDiscordApiDataUpdate
          };
        },
        resolve: ({ session, sessionToken }) => {
          if (!session || !sessionToken) {
            return status(401, 'Not logged in');
          }

          return { session, sessionToken };
        },
        beforeHandle: ({ session }) => {
          if (typeof v !== 'object') return;

          if (!session?.user.admin && v.admin) {
            return status(401, 'Not an admin');
          }

          if (!session?.user.approvedHost && v.approvedHost) {
            return status(401, 'Not an approved host');
          }
        }
      })
    });
