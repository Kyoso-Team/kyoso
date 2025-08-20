import { getSession } from '$lib/api.requests';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch }) => {
  const session = await getSession(fetch);
  return { session };
};
