import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';

function setOsuOAuthState(c: Context, state: string) {
  setCookie(c, 'osu_oauth_state', state, {
    path: '/',
    httpOnly: true,
    maxAge: 600,
    sameSite: 'lax'
  });
}

function getOsuOAuthState(c: Context) {
  const cookie = getCookie(c, 'osu_oauth_state');
  if (!cookie) {
    throw new HTTPException(400, {
      message: 'Missing cookie: osu_oauth_state'
    });
  }
  return cookie;
}

export const cookieService = { setOsuOAuthState, getOsuOAuthState };