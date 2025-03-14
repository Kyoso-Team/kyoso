import { Hono } from 'hono';
import { rateLimiter } from 'hono-rate-limiter';
import { getConnInfo } from 'hono/bun';
import { cors } from 'hono/cors';
import RedisStore from 'rate-limit-redis';
import { devRouter } from '$src/routers/dev.ts';
import { tournamentRouter } from '$src/routers/tournament';
import { authRouter } from './routers/auth';
import { redis } from './singletons';
import { env } from './utils/env';
import type { Store } from 'hono-rate-limiter';

const app = new Hono()
  .use(
    '/*',
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  )
  .use(
    rateLimiter({
      limit: 10,
      windowMs: 1000,
      keyGenerator: (c) => {
        const info = getConnInfo(c);

        return `${c.req.method}-${c.req.path}-${info.remote.address}`;
      },
      store: new RedisStore({
        prefix: 'ratelimit:',
        //@ts-expect-error - known issue with @ioredis/types
        sendCommand: (...args: string[]) => redis.call(...args)
      }) as unknown as Store
    })
  )
  .route('/', authRouter)
  .route('/', tournamentRouter)
  .route('/', devRouter);

export default app;
export type App = typeof app;
