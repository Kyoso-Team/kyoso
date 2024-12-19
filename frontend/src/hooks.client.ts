import { error, type HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = async ({ error: err }) => {
  if (err instanceof Response) {
    error(err.status, (await err.json()).message);
  }

  console.error(err);
};