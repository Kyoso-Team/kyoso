import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { authenticationService } from '$src/modules/authentication/service.ts';
import { User } from '$src/schema';
import { db } from '$src/singletons';
import type { InferSelectModel } from 'drizzle-orm';

export const sessionMiddleware = (options?: { admin?: true; approvedHost?: true }) =>
  createMiddleware<{
    Variables: {
      user: Pick<InferSelectModel<typeof User>, 'id' | 'admin' | 'approvedHost'>;
    };
  }>(async (c, next) => {
    const session = await authenticationService.validateSession(c, db, {
      user: {
        id: true,
        admin: true,
        approvedHost: true
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
      ...session.user
    });
    await next();
  });
