import { createServiceFnFromRepositoryQueryAndValidation } from '$src/utils/factories';
import { userRepository } from './repository';
import { UserValidation } from './validation';

export const createUser = createServiceFnFromRepositoryQueryAndValidation(
  UserValidation.CreateUser,
  userRepository.createUser,
  'user',
  'Failed to create user'
);

export const userService = { createUser };
