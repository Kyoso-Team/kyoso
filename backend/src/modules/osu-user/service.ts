import { createServiceFnFromRepositoryQuery } from '$src/utils/factories';
import { osuUserRepository } from './repository';
import { OsuUserValidation } from './validation';

export const createOsuUser = createServiceFnFromRepositoryQuery(
  OsuUserValidation.CreateOsuUser,
  osuUserRepository.createOsuUser,
  'osuUser',
  'Failed to create osu! user'
);

export const updateOsuUser = createServiceFnFromRepositoryQuery(
  OsuUserValidation.UpdateOsuUser,
  osuUserRepository.updateOsuUser,
  'osuUser',
  'Failed to update osu! user'
);

export const osuUserService = { createOsuUser, updateOsuUser };
