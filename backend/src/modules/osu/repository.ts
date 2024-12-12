import type { RedisClient } from '$src/types';

async function temporarilyStoreTokens(
  redis: RedisClient,
  tokens: {
    accessToken: string;
    refreshToken: string;
    tokenIssuedAt: number;
  },
  state: string,
  timeMs: number
) {
  return redis.set(`temp_osu_tokens:${state}`, JSON.stringify(tokens), 'PX', timeMs);
}

async function getTemporarilyStoredTokens(redis: RedisClient, state: string) {
  return redis.get(`temp_osu_tokens:${state}`);
}

async function deleteTemporarilyStoredTokens(redis: RedisClient, state: string) {
  return redis.del(`temp_osu_tokens:${state}`);
}

export const osuRepository = {
  temporarilyStoreTokens,
  getTemporarilyStoredTokens,
  deleteTemporarilyStoredTokens
};
