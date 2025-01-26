import { HTTPException } from 'hono/http-exception';
import * as v from 'valibot';
import { Tournament } from '$src/schema';
import { db } from '$src/singletons';
import { isUniqueConstraintViolationError, unknownError } from '$src/utils/error';
import { createServiceFnFromRepositoryQueryAndValidation } from '$src/utils/factories';
import { tournamentRepository } from './repository';
import { TournamentValidation } from './validation';

const createTournamentFn = createServiceFnFromRepositoryQueryAndValidation(
  TournamentValidation.CreateTournament,
  tournamentRepository.createTournament,
  'tournament',
  'Failed to create tournament'
);

async function createTournament(body: v.InferOutput<typeof TournamentValidation.CreateTournament>) {
  const tournament = await createTournamentFn(db, body);

  tournamentRepository.syncTournament({
    ...body,
    id: tournament.id,
    publishedAt: null,
    deletedAt: null
  });

  return tournament;
}

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
