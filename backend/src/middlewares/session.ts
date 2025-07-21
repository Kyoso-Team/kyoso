import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { AuthenticationService } from '$src/modules/authentication/authentication.service';
import { User } from '$src/schema';
import { db } from '$src/singletons';
import type { InferSelectModel } from 'drizzle-orm';
import type { DiscordUser, OsuUser } from '$src/schema';
import { elysia } from '$src/routers/base';
import { env } from '$src/utils/env';
import { sessionRepository } from '$src/modules/session/session.repository';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';

export type UserTokens = {
  osu: Pick<InferSelectModel<typeof OsuUser>, 'osuUserId' | 'token'>;
  discord: Pick<InferSelectModel<typeof DiscordUser>, 'discordUserId' | 'token'>;
};

export const SessionGuard = elysia({name: 'SessionGuard'})
  .macro({
    loggedIn: {
      async resolve({cookie, status}) {
        const token = env.NODE_ENV === 'test' ? await Bun.file(`${process.cwd()}/test-tokens/session.txt`).text() : cookie.session.value;

        if (!token) {
          throw status(401);
        }

        const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
        const session = await sessionRepository.getSession(db, sessionId, {
          id: true,
          expiresAt: true,

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
          throw status(401);
        }

        return {
          ...session.user,
          osu: session.osu,
          discord: session.discord
        };
      }
    }
  });

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
