import { ENV } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const { url } = event;

  if (ENV === 'production' && url.pathname.startsWith('/dev')) {
    return new Response('Not allowed in production');
  }

  return await resolve(event);
};
