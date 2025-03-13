import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { devRouter } from '$src/routers/dev.ts';
import { tournamentRouter } from '$src/routers/tournament';
import { authRouter } from './routers/auth';
import { staffRoleRouter } from './routers/staff-role';
import { env } from './utils/env';

const app = new Hono()
  .use(
    '/*',
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  )
  .route('/', authRouter)
  .route('/', tournamentRouter)
  .route('/', devRouter)
  .route('/', staffRoleRouter);

export default app;
export type App = typeof app;
