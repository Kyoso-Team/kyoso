import { Client } from 'osu-web.js';
import { unknownError } from '$src/utils/error';
import { Service } from '$src/utils/service';
import { osuRepository } from './osu.repository';
import { osuOAuth } from '$src/singletons/oauth';
import type * as s from '$src/utils/validation';

export class OsuService extends Service {
  public async getTokens(code: string) {
    return osuOAuth
      .validateAuthorizationCode(code)
      .catch(unknownError('Failed to validate osu! authorization code'));
  }

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

  public async setTempOsuTokens(
    tokens: s.OAuthToken,
    state: string
  ) {
    await this.execute(osuRepository.kv.setTempOsuTokens(tokens, state));
  }

  public async getTempOsuTokens(state: string) {
    return await this.execute(
      osuRepository.kv.getTempOsuTokens(state)
    );
  }

  public async deleteTempOsuTokens(state: string) {
    return await this.execute(
      osuRepository.kv.deleteTempOsuTokens(state)
    );
  }
}
