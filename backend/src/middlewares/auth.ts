import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { authenticationService } from '$src/modules/authentication/service.ts';
import { User } from '$src/schema';
import { db } from '$src/singletons';
import type { InferSelectModel } from 'drizzle-orm';

export const authMiddleware = createMiddleware<{
  Variables: {
    user: Pick<InferSelectModel<typeof User>, 'id'>;
  };
}>(async (c, next) => {
  const session = await authenticationService.validateSession(c, db, {
    user: {
      id: true
    }
  });

  if (!session) {
    throw new HTTPException(401, {
      message: 'Unauthorized'
    });
  }

  c.set('user', {
    ...session.user
  });
  await next();
});
