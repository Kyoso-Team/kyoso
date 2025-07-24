import { Client } from 'osu-web.js';
import { unknownError } from '$src/utils/error';
import { Service } from '$src/utils/service';

export class OsuService extends Service {
  public async getOsuSelf(accessToken: string) {
    const osu = new Client(accessToken);
    const user = await osu.users.getSelf().catch(unknownError('Failed to get osu! user data'));
    return user;
  }
}
