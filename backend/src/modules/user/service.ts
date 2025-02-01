import type { DatabaseClient } from '$src/types';
import { Service } from '$src/utils/service';
import { userRepository } from './repository';
import { UserValidation, type UserValidationInput } from './validation';

class UserService extends Service {
  public async createUser(
    db: DatabaseClient,
    userInput: UserValidationInput['CreateUser']
  ) {
    const fn = this.createServiceFunction('Failed to create user');
    const user = await fn.validate(UserValidation.CreateUser, 'user', userInput);
    return await fn.handleDbQuery(userRepository.createUser(db, user));
  }

  public async createCountry(db: DatabaseClient, countryInput: UserValidationInput['CreateCountry']) {
    const fn = this.createServiceFunction('Failed to create country');
    const country = await fn.validate(UserValidation.CreateCountry, 'country', countryInput);
    return await fn.handleDbQuery(userRepository.createCountry(db, country));
  }

  public async createOsuUser(
    db: DatabaseClient,
    osuUserInput: UserValidationInput['CreateOsuUser']
  ) {
    const fn = this.createServiceFunction('Failed to create osu! user');
    const osuUser = await fn.validate(UserValidation.CreateOsuUser, 'osuUser', osuUserInput);
    return await fn.handleDbQuery(userRepository.createOsuUser(db, osuUser));
  }

  public async updateOsuUser(
    db: DatabaseClient,
    osuUserInput: UserValidationInput['UpdateOsuUser'],
    osuUserId: number
  ) {
    const fn = this.createServiceFunction('Failed to update osu! user');
    const osuUser = await fn.validate(UserValidation.UpdateOsuUser, 'osuUser', osuUserInput);
    return await fn.handleDbQuery(userRepository.updateOsuUser(db, osuUser, osuUserId));
  }

  public async createDiscordUser(
    db: DatabaseClient,
    discordUserInput: UserValidationInput['CreateDiscordUser']
  ) {
    const fn = this.createServiceFunction('Failed to create Discord user');
    const discordUser = await fn.validate(UserValidation.CreateDiscordUser, 'discordUser', discordUserInput);
    return await fn.handleDbQuery(userRepository.createDiscordUser(db, discordUser));
  }

  public async updateDiscordUser(
    db: DatabaseClient,
    discordUserInput: UserValidationInput['UpdateDiscordUser'],
    discordUserId: bigint
  ) {
    const fn = this.createServiceFunction('Failed to update Discord user');
    const discordUser = await fn.validate(UserValidation.UpdateDiscordUser, 'discordUser', discordUserInput);
    return await fn.handleDbQuery(userRepository.updateDiscordUser(db, discordUser, discordUserId));
  }
}

export const userService = new UserService();
