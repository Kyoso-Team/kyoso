import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

export const devCheckMiddleware = createMiddleware(async (c, next) => {
  if (process.env.NODE_ENV !== 'development') {
    throw new HTTPException(403, {
      message: 'This endpoint is only available in development environment'
    });
  }
  await next();
});
