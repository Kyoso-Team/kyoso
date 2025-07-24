import { KvRepository } from '$src/modules/_base/repository';
import { time } from '$src/utils';
import { OAuthToken } from '$src/utils/validation';

class OsuKvRepository extends KvRepository {
  public setTempOsuTokens(state: string, tokens: OAuthToken) {
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
      map: (value: string | null) => (value ? (JSON.parse(value) as OAuthToken) : null)
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
