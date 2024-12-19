import { PUBLIC_API_URL } from '$env/static/public';
import { hc } from 'hono/client';
import type { App } from 'backend';

export const api = hc<App>(PUBLIC_API_URL);
