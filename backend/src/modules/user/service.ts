import type { DatabaseClient } from '$src/types';
import { unknownError, validationError } from '$src/utils/error';
import { userRepository } from './repository';
import { UserValidation, type UserValidationOutput } from './validation';
import * as v from 'valibot';

async function createUser(db: DatabaseClient, user: UserValidationOutput['CreateUser']) {
  const errorDescription = 'Failed to create user';
  const parsed = await v.parseAsync(UserValidation.CreateUser, user).catch(
    validationError(errorDescription, 'user')
  );
  return await userRepository.createUser(db, parsed).catch(unknownError('Failed to create user'));
}

export const userService = { createUser };