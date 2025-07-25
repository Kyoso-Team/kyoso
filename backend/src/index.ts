// import { Hono } from 'hono';
// import { rateLimiter } from 'hono-rate-limiter';
// import { getConnInfo } from 'hono/bun';
// import { cors } from 'hono/cors';
// import RedisStore from 'rate-limit-redis';

// import { tournamentRouter } from '$src/routers/tournament';
// import { apiKeyRouter } from './routers/api-key';
// import { authRouter } from './routers/auth';
// import { staffMemberRouter } from './routers/staff-member';
// import { staffRoleRouter } from './routers/staff-role';
// import { redis } from './singletons';
// import { env } from './utils/env';
// import { requestId } from 'hono/request-id';
// import type { Store } from 'hono-rate-limiter';
import { Elysia } from 'elysia';
import { devRouter } from '$src/routers/dev.router';
import { authRouter } from './routers/auth.router';

// const app = new Hono()
//   .use(
//     '/*',
//     cors({
//       origin: env.CORS_ORIGIN,
//       credentials: true
//     })
//   )
//   .use(
//     rateLimiter({
//       limit: 10,
//       windowMs: 1000,
//       keyGenerator: (c) => {
//         const info = getConnInfo(c);

//         return `${c.req.method}-${c.req.path}-${info.remote.address}`;
//       },
//       store: new RedisStore({
//         prefix: 'ratelimit:',
//         // Known issue with @ioredis/types
//         sendCommand: (...args: [string, ...string[]]) => redis.call(...args) as any
//       }) as unknown as Store,
//       skip: () => env.NODE_ENV === 'test'
//     })
//   )
//   .use('*', requestId({
//     generator: () => Bun.randomUUIDv7()
//   }))
//   .route('/', authRouter)
//   .route('/', tournamentRouter)
//   .route('/', devRouter)
//   .route('/', staffRoleRouter)
//   .route('/', staffMemberRouter)
//   .route('/', apiKeyRouter);

const app = new Elysia().use(devRouter).use(authRouter);

export default app;
export type App = typeof app;
