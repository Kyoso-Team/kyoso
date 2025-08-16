import { treaty } from '@elysiajs/eden';
import { PUBLIC_API_URL } from '$env/static/public';
import type { App } from 'backend';

export const api = (fetcher: typeof fetch) => treaty<App>(PUBLIC_API_URL, {
  fetcher,
  fetch: {
    credentials: 'include',
    mode: 'cors'
  },
  onResponse: async (resp) => {
    const cloned = resp.clone();
    const txt = await cloned.text();

    if (resp.ok && txt === '') {
      return null;
    }

    if (resp.ok && /^\d+$/g.test(txt)) {
      return Number(txt);
    }
  }
});

export const loginUrl = `${PUBLIC_API_URL}/auth/login`;

export const logoutUrl = `${PUBLIC_API_URL}/auth/logout`;

type MapApiRoutes<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? ReturnType<T[K]> extends Promise<any>
      ? Extract<Awaited<ReturnType<T[K]>>, { error: null }>['data']
      : MapApiRoutes<ReturnType<T[K]>>
    : T[K] extends Record<string, any>
      ? MapApiRoutes<T[K]>
      : never;
};
export type Api = MapApiRoutes<ReturnType<typeof api>>;