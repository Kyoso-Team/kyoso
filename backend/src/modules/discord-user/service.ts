import { createServiceFnFromRepositoryQueryAndValidation } from '$src/utils/factories';
import { discordUserRepository } from './repository';
import { DiscordUserValidation } from './validation';

const createDiscordUser = createServiceFnFromRepositoryQueryAndValidation(
  DiscordUserValidation.CreateDiscordUser,
  discordUserRepository.createDiscordUser,
  'discordUser',
  'Failed to create Discord user'
);

const updateDiscordUser = createServiceFnFromRepositoryQueryAndValidation(
  DiscordUserValidation.UpdateDiscordUser,
  discordUserRepository.updateDiscordUser,
  'discordUser',
  'Failed to update Discord user'
);

export const discordUserService = { createDiscordUser, updateDiscordUser };
