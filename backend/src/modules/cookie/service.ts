import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import type { Context } from 'hono';

function setOAuthState(c: Context, forOAuth: 'osu' | 'discord', state: string) {
  setCookie(c, `${forOAuth}_oauth_state`, state, {
    path: '/',
    httpOnly: true,
    maxAge: 600 /* 10 minutes */,
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
    maxAge: 8208000 /* 95 days */,
    sameSite: 'lax'
  });
}

function deleteSession(c: Context) {
  deleteCookie(c, 'session');
}

function getSession(c: Context) {
  return getCookie(c, 'session');
}

function setRedirectPath(c: Context, redirectPath: string) {
  setCookie(c, 'redirect_path', redirectPath, {
    path: '/',
    httpOnly: true,
    maxAge: 600 /* 10 minutes */,
    sameSite: 'lax'
  });
}

function deleteRedirectPath(c: Context) {
  deleteCookie(c, 'redirect_path');
}

function getRedirectPath(c: Context) {
  return getCookie(c, 'redirect_path');
}

export const cookieService = { setOAuthState, getOAuthState, setSession, deleteSession, getSession, setRedirectPath, deleteRedirectPath, getRedirectPath };
