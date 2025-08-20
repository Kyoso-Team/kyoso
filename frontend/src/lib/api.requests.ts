import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import { api } from './api';

type ApiRequest = (fetcher: typeof fetch, ...args: any[]) => Promise<any>;

function handleError(err: {
  status: any;
  value: any;
} | null, headers: HeadersInit | undefined) {
  if (browser) {
    // TODO: Display the error to the user
    console.error(err);
  } else {
    error(err?.status ?? 500, `API error (in request ${new Headers(headers).get('x-request-id') ?? 'COULD NOT FIND ID'}): ${err?.value ?? 'Unknown error'}`);
  }
}

export const getSession = (async (fetcher) => {
  const resp = await api(fetcher).auth.session.get();
  if (resp.error?.status === 401 && resp.error.value === 'Not logged in') {
    return null;
  } else if (resp.error) {
    handleError(resp.error, resp.headers);
  }
  
  return resp.data;
}) satisfies ApiRequest;