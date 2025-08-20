import { error } from '@sveltejs/kit';
import { api } from '$lib/api';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch }) => {
  const resp = await api(fetch).auth.session.get();

  // TODO: Better handling of non-200 status codes
  if (resp.status !== 200) {
    throw resp;
  }

  const session = resp.data;

  if (session === null) {
    error(401, 'Not logged in');
  }

  return { session };
};
