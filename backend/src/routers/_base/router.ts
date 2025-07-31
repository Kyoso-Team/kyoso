import { AuthenticationService } from '$src/modules/authentication/authentication.service';
import { CookieService } from '$src/modules/cookie/cookie.service';
import { DiscordService } from '$src/modules/discord/discord.service';
import { OsuService } from '$src/modules/osu/osu.service';
import { env } from '$src/utils/env';
import { status } from 'elysia';
import { common, type RouterConfig } from './common';

export const createRouter = (config?: RouterConfig) =>
  common(config)
    .derive(() => ({
      forceOsuApiDataUpdate: false,
      forceDiscordApiDataUpdate: false
    }))
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
    .macro({
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