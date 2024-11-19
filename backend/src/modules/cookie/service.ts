import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';

function setOAuthState(c: Context, forOAuth: 'osu' | 'discord', state: string) {
  setCookie(c, `${forOAuth}_oauth_state`, state, {
    path: '/',
    httpOnly: true,
    maxAge: 600,
    sameSite: 'lax'
  });
}

function getOAuthState(c: Context, forOAuth: 'osu' | 'discord') {
  const cookieName = `${forOAuth}_oauth_state`;
  const cookie = getCookie(c, cookieName);
  if (!cookie) {
    throw new HTTPException(400, {
      message: `Missing cookie: ${cookieName}`
    });
  }
  return cookie;
}

export const cookieService = { setOAuthState, getOAuthState };