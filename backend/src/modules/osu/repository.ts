import { time } from '$src/utils';
import { KvRepository } from '$src/utils/repository';
import * as s from '$src/utils/validation';

class OsuKvRepository extends KvRepository {
  public setTempOsuTokens(
    tokens: s.OAuthToken,
    state: string
  ) {
    return this.wrap.set({
      key: this.keys.temporaryOsuTokens(state),
      value: tokens,
      map: JSON.stringify,
      name: 'Set temporarily stored osu! tokens',
      expires: time.minutes(5)
    });
  }

  public getTempOsuTokens(state: string) {
    return this.wrap.get({
      key: this.keys.temporaryOsuTokens(state),
      name: 'Get temporarily stored osu! tokens',
      map: (value: string) => JSON.parse(value) as s.OAuthToken
    });
  }

  public deleteTempOsuTokens(state: string) {
    return this.wrap.delete({
      key: this.keys.temporaryOsuTokens(state),
      name: 'Delete temporarily stored osu! tokens'
    });
  }
}

class OsuRepository {
  public kv = new OsuKvRepository();
}

export const osuRepository = new OsuRepository();
