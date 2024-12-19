import { Hono } from 'hono';
import { authRouter } from './routers/auth';

const app = new Hono().route('/', authRouter);

export default app;
export type App = typeof app;

