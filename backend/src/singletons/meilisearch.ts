import { MeiliSearch } from 'meilisearch';
import { env } from '$src/utils/env.ts';

export const meilisearch = new MeiliSearch({
  host: env.MEILI_HOST,
  apiKey: env.MEILI_MASTER_KEY
});
