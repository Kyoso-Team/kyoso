import { getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import type { Context } from 'hono';

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

function setSession(c: Context, sessionToken: string) {
  setCookie(c, 'session', sessionToken, {
    path: '/',
    httpOnly: true,
    maxAge: 2592000 /* 30 days */,
    sameSite: 'lax'
  });
}

function getSession(c: Context) {
  return getCookie(c, 'session');
}

export const cookieService = { setOAuthState, getOAuthState, setSession, getSession };
