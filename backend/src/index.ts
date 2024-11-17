import { Hono } from 'hono';
import { authRouter } from './routers/auth';

const app = new Hono();

app.route('/', authRouter);

export default app;
