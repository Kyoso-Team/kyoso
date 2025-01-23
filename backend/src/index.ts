import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { tournamentsRouter } from '$src/routers/tournaments.ts';
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
  .route('/', tournamentsRouter);

export default app;
export type App = typeof app;
