import { HTTPException } from 'hono/http-exception';
import { Tournament } from '$src/schema';
import { isUniqueConstraintViolationError, unknownError } from '$src/utils/error';
import { createServiceFnFromRepositoryQueryAndValidation } from '$src/utils/factories';
import { tournamentRepository } from './repository';
import { TournamentValidation } from './validation';

const createTournament = createServiceFnFromRepositoryQueryAndValidation(
  TournamentValidation.CreateTournament,
  tournamentRepository.createTournament,
  'tournament',
  'Failed to create tournament'
);

function handleTournamentCreationError(
  tournament: { name: string; urlSlug: string },
  descriptionIfUnknownError: string
) {
  return (err: unknown): never => {
    if (isUniqueConstraintViolationError(err, [Tournament.name])) {
      throw new HTTPException(409, {
        message: `Tournament with name ${tournament.name} already exists`
      });
    }

    if (isUniqueConstraintViolationError(err, [Tournament.urlSlug])) {
      throw new HTTPException(409, {
        message: `Tournament with URL slug ${tournament.urlSlug} already exists`
      });
    }

    unknownError(descriptionIfUnknownError)(err);
    return undefined as never;
  };
}

export const tournamentService = {
  createTournament,
  handleTournamentCreationError
};
