import { api } from '$lib/api';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
  const resp = await api.auth.session.$get();

  if (resp.status !== 200) {
    throw resp;
  }

  const session = await resp.json();
  return { session };
};
