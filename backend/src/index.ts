import { Elysia } from 'elysia';
import { devRouter } from '$src/routers/dev.router';
import { authRouter } from './routers/auth.router';
import { staffMemberRouter } from './routers/staff-member.router';
import { staffRoleRouter } from './routers/staff-role.router';
import { tournamentRouter } from './routers/tournament.router';
import { apiKeyRouter } from './routers/api-key.router';
import { env } from './utils/env';
import { cors } from '@elysiajs/cors';

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

// TODO: Ratelimit
const app = new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN
    })
  )
  .use(devRouter)
  .use(authRouter)
  .use(staffMemberRouter)
  .use(staffRoleRouter)
  .use(tournamentRouter)
  .use(apiKeyRouter);

export default app;
export type App = typeof app;
