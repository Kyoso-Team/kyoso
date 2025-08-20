import { api } from '$lib/api';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch }) => {
  const resp = await api(fetch).auth.session.get();

  // TODO: Better handling of non-200 status codes
  if (resp.error?.status === 401 && resp.error.value === 'Not logged in') {
    return { session: null };
  } else {
    throw resp.error;
  }

  const session = resp.data;
  return { session };
};
