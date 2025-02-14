import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import type { Context } from 'hono';

class CookieService {
  // Values in ms
  private MINUTES_10 = 600;
  private DAYS_90 = 7776000;

  public setOAuthState(c: Context, forOAuth: 'osu' | 'discord', state: string) {
    setCookie(c, `${forOAuth}_oauth_state`, state, {
      path: '/',
      httpOnly: true,
      maxAge: this.MINUTES_10,
      sameSite: 'lax'
    });
  }

  public getOAuthState(c: Context, forOAuth: 'osu' | 'discord') {
    const cookieName = `${forOAuth}_oauth_state`;
    const cookie = getCookie(c, cookieName);
    if (!cookie) {
      throw new HTTPException(400, {
        message: `Missing cookie: ${cookieName}`
      });
    }
    return cookie;
  }

  public setSession(c: Context, sessionToken: string) {
    setCookie(c, 'session', sessionToken, {
      path: '/',
      httpOnly: true,
      maxAge: this.DAYS_90,
      sameSite: 'lax'
    });
  }

  public deleteSession(c: Context) {
    deleteCookie(c, 'session');
  }

  public getSession(c: Context) {
    return getCookie(c, 'session');
  }

  public setRedirectPath(c: Context, redirectPath: string) {
    setCookie(c, 'redirect_path', redirectPath, {
      path: '/',
      httpOnly: true,
      maxAge: this.MINUTES_10,
      sameSite: 'lax'
    });
  }

  public deleteRedirectPath(c: Context) {
    deleteCookie(c, 'redirect_path');
  }

  public getRedirectPath(c: Context) {
    return getCookie(c, 'redirect_path');
  }
}

export const cookieService = new CookieService();
