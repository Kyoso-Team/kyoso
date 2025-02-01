import { Client } from 'osu-web.js';
import { unknownError } from '$src/utils/error';
import { Service } from '$src/utils/service';
import { AuthenticationValidation } from '../authentication/validation';
import { osuRepository } from './repository';
import type { RedisClient } from '$src/types';
import type { AuthenticationValidationInput } from '../authentication/validation';

class OsuService extends Service {
  public async getOsuSelf(accessToken: string) {
    const osu = new Client(accessToken);
    const user = await osu.users.getSelf().catch(unknownError('Failed to get osu! user data'));
    return user;
  }

  public getOsuUserIdFromAccessToken(accessToken: string) {
    const payloadString = accessToken.substring(
      accessToken.indexOf('.') + 1,
      accessToken.lastIndexOf('.')
    );
    const payloadBuffer = Buffer.from(payloadString, 'base64').toString('ascii');
    const payload: { sub: string } = JSON.parse(payloadBuffer);
    const osuUserId = Number(payload.sub);
    return osuUserId;
  }

  public async temporarilyStoreTokens(
    redis: RedisClient,
    tokensInput: AuthenticationValidationInput['OAuthToken'],
    state: string,
    timeMs: number
  ) {
    const fn = this.createServiceFunction('Failed to temporarily store osu! tokens');
    const tokens = await fn.validate(AuthenticationValidation.OAuthToken, 'tokens', tokensInput);
    return await fn.handleRedisQuery(
      osuRepository.temporarilyStoreTokens(redis, tokens, state, timeMs)
    );
  }

  public async getTemporarilyStoredTokens(redis: RedisClient, state: string) {
    const fn = this.createServiceFunction('Failed to get temporarily store osu! tokens');
    const result = await fn.handleRedisQuery(
      osuRepository.getTemporarilyStoredTokens(redis, state)
    );
    if (!result) return null;

    const data = await fn.validate(
      AuthenticationValidation.OAuthToken,
      'tempStoredTokens',
      JSON.parse(result)
    );
    return data;
  }

  public async deleteTemporarilyStoredTokens(redis: RedisClient, state: string) {
    const fn = this.createServiceFunction('Failed to delete temporarily stored osu! tokens');
    return await fn.handleRedisQuery(osuRepository.deleteTemporarilyStoredTokens(redis, state));
  }
}

export const osuService = new OsuService();
