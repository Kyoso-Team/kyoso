import { Hono } from 'hono';
import { authRouter } from './routers/auth';
import { cors } from 'hono/cors';
import { env } from './utils/env';

const app = new Hono()
  .use('/*', cors({
    origin: env.CORS_ORIGIN,
    credentials: true
  }))
  .route('/', authRouter);

export default app;
export type App = typeof app;
