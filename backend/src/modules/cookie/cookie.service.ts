import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { time } from '$src/utils';
import type { Context } from 'hono';
import { Service } from '$src/utils/service';

export class CookieService extends Service {
  public setOAuthState(c: Context, forOAuth: 'osu' | 'discord', state: string) {
    setCookie(c, `${forOAuth}_oauth_state`, state, {
      path: '/',
      httpOnly: true,
      maxAge: time.minutes(10),
      sameSite: 'lax'
    });
  }

  public getOAuthState(c: Context, forOAuth: 'osu' | 'discord') {
    const cookieName = `${forOAuth}_oauth_state`;
    const cookie = getCookie(c, cookieName);
    return cookie;
  }

  public setSession(c: Context, sessionToken: string) {
    setCookie(c, 'session', sessionToken, {
      path: '/',
      httpOnly: true,
      maxAge: time.days(90),
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
      maxAge: time.minutes(10),
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
