import { DiscordValidation } from './validation';
import { Service } from '$src/utils/service';

class DiscordService extends Service {
  public async getDiscordSelf(accessToken: string) {
    return this.fetch(
      'https://discord.com/api/users/@me',
      'GET',
      'Failed to get discord user data',
      DiscordValidation.DiscordUserResponse,
      'discordUser',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
  }
}

export const discordService = new DiscordService();
