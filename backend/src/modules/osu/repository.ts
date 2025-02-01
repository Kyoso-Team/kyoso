import type { RedisClient } from '$src/types';

class OsuRepository {
  private tempOsuTokensKeyBase = 'temp_osu_tokens';

  public async temporarilyStoreTokens(
    redis: RedisClient,
    tokens: {
      accessToken: string;
      refreshToken: string;
      tokenIssuedAt: number;
    },
    state: string,
    timeMs: number
  ) {
    return redis.set(`${this.tempOsuTokensKeyBase}:${state}`, JSON.stringify(tokens), 'PX', timeMs);
  }
  
  public async getTemporarilyStoredTokens(redis: RedisClient, state: string) {
    return redis.get(`${this.tempOsuTokensKeyBase}:${state}`);
  }
  
  public async deleteTemporarilyStoredTokens(redis: RedisClient, state: string) {
    return redis.del(`${this.tempOsuTokensKeyBase}:${state}`);
  }
}

export const osuRepository = new OsuRepository();
