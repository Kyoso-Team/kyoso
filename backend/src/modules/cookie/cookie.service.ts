import { time } from '$src/utils';
import { Service } from '$src/utils/service';
import type { Cookie } from 'elysia';
import type { ElysiaCookie } from 'elysia/cookies';

type Updater<T> = T | ((value: T) => T);
type Cookies = Record<string, Cookie<string | undefined>>;

export class CookieService extends Service {
  private setCookie(cookies: Cookies, name: string, config: Updater<Partial<ElysiaCookie>>) {
    cookies[name].set(config);
  }

  private deleteCookie(cookies: Cookies, name: string) {
    cookies[name]?.remove();
  }

  private getCookie(cookies: Cookies, name: string) {
    return cookies[name]?.value;
  }

  public setOAuthState(cookies: Cookies, forOAuth: 'osu' | 'discord', state: string) {
    this.setCookie(cookies, `${forOAuth}_oauth_state`, {
      value: state,
      path: '/',
      httpOnly: true,
      maxAge: time.minutes(10),
      sameSite: 'lax'
    });
  }

  public getOAuthState(cookies: Cookies, forOAuth: 'osu' | 'discord') {
    const cookieName = `${forOAuth}_oauth_state`;
    const cookie = this.getCookie(cookies, cookieName);
    return cookie;
  }

  public setSession(cookies: Cookies, sessionToken: string) {
    this.setCookie(cookies, 'session', {
      value: sessionToken,
      path: '/',
      httpOnly: true,
      maxAge: time.days(90),
      sameSite: 'lax'
    });
  }

  public deleteSession(cookies: Cookies) {
    this.deleteCookie(cookies, 'session');
  }

  public getSession(cookies: Cookies) {
    return this.getCookie(cookies, 'session');
  }

  public setRedirectPath(cookies: Cookies, redirectPath: string) {
    this.setCookie(cookies, 'redirect_path', {
      value: redirectPath,
      path: '/',
      httpOnly: true,
      maxAge: time.minutes(10),
      sameSite: 'lax'
    });
  }

  public deleteRedirectPath(cookies: Cookies) {
    this.deleteCookie(cookies, 'redirect_path');
  }

  public getRedirectPath(cookies: Cookies) {
    return this.getCookie(cookies, 'redirect_path');
  }
}
