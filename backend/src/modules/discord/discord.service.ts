import { Service } from '$src/utils/service';
import * as v from 'valibot';

export class DiscordService extends Service {
  public async getDiscordSelf(accessToken: string) {
    return this.fetch({
      url: 'https://discord.com/api/users/@me',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      schema: v.object({
        id: v.string(),
        username: v.string()
      }),
      error: {
        fetchFailed: 'Failed to get Discord user data',
        unhandledStatus: 'Unhandled status code when getting Discord user data',
        validationFailed: 'Discord user response doesn\'t match the expected schema',
        parseFailed: 'Failed to parse Discord user data'
      }
    });
  }
}
