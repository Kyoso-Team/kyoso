import { sessionRepository } from './repository';
import { SessionValidation } from './validation';
import { createServiceFnFromRepositoryQueryAndValidation } from '$src/utils/factories';

const createSession =  createServiceFnFromRepositoryQueryAndValidation(
  SessionValidation.CreateSession,
  sessionRepository.createSession,
  'session',
  'Failed to create session'
);

export const sessionService = { createSession };
