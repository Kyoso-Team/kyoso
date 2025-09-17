import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import { api } from './api';
import type { ApiFns, Body } from './api';
import { toast } from './state/toast.svelte';

type ApiRequest = (fetcher: typeof fetch, ...args: any[]) => Promise<any>;

function handleError(err: {
  status: any;
  value: any;
} | null, headers: HeadersInit | undefined): never {
  const errMsg = err?.value ?? 'Unknown error';
  const requestId = new Headers(headers).get('x-request-id') ?? 'COULD NOT FIND ID';

  if (browser) {
    let message = '';

    if (err?.status === 422) {
      message = `Validation error: ${errMsg}`;
      toast.add({ message, type: 'error' });
    } else {
      message = `API error (in request ${requestId}): ${errMsg}`;
      toast.add({ message, type: 'error' });
    }

    throw Error(message, { cause: err });
  } else {
    error(err?.status ?? 500, `API error (in request ${requestId}): ${errMsg}`);
  }
}

export const getSession = (async (fetcher) => {
  const resp = await api(fetcher).auth.session.get();
  if (resp.error?.status === 401 && resp.error.value === 'Not logged in') {
    return null;
  } else if (resp.error) {
    return handleError(resp.error, resp.headers);
  }
  
  return resp.data;
}) satisfies ApiRequest;

export const createTournament = (async (fetcher, tournament: Body<ApiFns['tournament']['post']>) => {
  const resp = await api(fetcher).tournament.post(tournament);
  if (resp.error) {
    return handleError(resp.error, resp.headers);
  }
  
  return resp.data;
}) satisfies ApiRequest;
