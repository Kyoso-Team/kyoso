import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { authenticationService } from '$src/modules/authentication/service.ts';
import { User } from '$src/schema';
import { db } from '$src/singletons';
import type { InferSelectModel } from 'drizzle-orm';
import type { DiscordUser, OsuUser } from '$src/schema';

export type UserTokens = {
  osu: Pick<InferSelectModel<typeof OsuUser>, 'osuUserId' | 'token'>;
  discord: Pick<InferSelectModel<typeof DiscordUser>, 'discordUserId' | 'token'>;
};

export const sessionMiddleware = (options?: { admin?: true; approvedHost?: true }) =>
  createMiddleware<{
    Variables: {
      user: Pick<InferSelectModel<typeof User>, 'id' | 'admin' | 'approvedHost'> & UserTokens;
    };
  }>(async (c, next) => {
    const session = await authenticationService.validateSession(c, db, {
      user: {
        id: true,
        admin: true,
        approvedHost: true,
        osu: {
          osuUserId: true,
          token: true
        },
        discord: {
          discordUserId: true,
          token: true
        }
      }
    });

    if (!session) {
      throw new HTTPException(401, {
        message: 'Not logged in'
      });
    }

    if (options?.admin && !session.user.admin) {
      throw new HTTPException(401, {
        message: 'Not an admin'
      });
    }

    if (options?.approvedHost && !session.user.approvedHost) {
      throw new HTTPException(401, {
        message: 'Not an approved host'
      });
    }

    c.set('user', {
      ...session.user,
      osu: session.osu,
      discord: session.discord
    });
    await next();
  });
