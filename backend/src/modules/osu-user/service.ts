import { createServiceFnFromRepositoryQueryAndValidation } from '$src/utils/factories';
import { osuUserRepository } from './repository';
import { OsuUserValidation } from './validation';

export const createOsuUser = createServiceFnFromRepositoryQueryAndValidation(
  OsuUserValidation.CreateOsuUser,
  osuUserRepository.createOsuUser,
  'osuUser',
  'Failed to create osu! user'
);

export const updateOsuUser = createServiceFnFromRepositoryQueryAndValidation(
  OsuUserValidation.UpdateOsuUser,
  osuUserRepository.updateOsuUser,
  'osuUser',
  'Failed to update osu! user'
);

export const osuUserService = { createOsuUser, updateOsuUser };
