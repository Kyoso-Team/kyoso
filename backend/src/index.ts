import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { tournamentRouter } from '$src/routers/tournament';
import { devRouter } from '$src/routers/dev.ts';
import { authRouter } from './routers/auth';
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
  .route('/', tournamentRouter);

if (env.NODE_ENV === 'development') {
  app.route('/', devRouter);
}

export default app;
export type App = typeof app;
