import { MeiliSearch } from 'meilisearch';
import { env } from '$src/utils/env.ts';

export const meilisearch = new MeiliSearch({
  host: env.MEILISEARCH_HOST,
  apiKey: env.MEILISEARCH_MASTER_KEY
});
