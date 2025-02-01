import { Service } from '$src/utils/service';
import { DiscordValidation } from './validation';

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
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
  }
}

export const discordService = new DiscordService();
