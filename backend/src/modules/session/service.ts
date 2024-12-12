import { createServiceFnFromRepositoryQueryAndValidation } from '$src/utils/factories';
import { sessionRepository } from './repository';
import { SessionValidation } from './validation';

const createSession = createServiceFnFromRepositoryQueryAndValidation(
  SessionValidation.CreateSession,
  sessionRepository.createSession,
  'session',
  'Failed to create session'
);

export const sessionService = { createSession };
