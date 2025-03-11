import { HTTPException } from 'hono/http-exception';
import { Tournament } from '$src/schema';
import { isUniqueConstraintViolationError, unknownError } from '$src/utils/error';
import { Service } from '$src/utils/service';
import { userRepository } from '../user/repository';
import { tournamentRepository } from './repository';
import { tournamentDynamicValidation } from './validation';
import type { DatabaseClient } from '$src/types';
import type { TournamentValidationInput, TournamentValidationOutput } from './validation';

class TournamentService extends Service {
  private HOST_RESTRICTED_FIELDS: Set<keyof TournamentValidationOutput['UpdateTournament']> =
    new Set([
      'name',
      'urlSlug',
      'acronym',
      'description',
      'teamSize',
      'useTeamBanners',
      'rankRange',
      'bws'
    ]);

  public async createDummyTournament(
    db: DatabaseClient,
    n: number,
    hostUserId: number,
    type: TournamentValidationInput['CreateTournament']['type'],
    teamSettings?: {
      minSize: number;
      maxSize: number;
      useBanners?: boolean;
    }
  ) {
    this.checkTest();
    return this.createTournament(db, {
      acronym: `T${n}`,
      name: `Tournament ${n}`,
      urlSlug: `t${n}`,
      hostUserId,
      type,
      teamSize: teamSettings
        ? {
            min: teamSettings.minSize,
            max: teamSettings.maxSize
          }
        : undefined,
      useTeamBanners: teamSettings?.useBanners
    } as any);
  }

  public async createTournament(
    db: DatabaseClient,
    input: TournamentValidationOutput['CreateTournament']
  ) {
    const fn = this.createServiceFunction('Failed to create tournament');

    const tournament = await fn.handleDbQuery(
      tournamentRepository.createTournament(db, input),
      this.handleTournamentCreationError(
        {
          name: input.name,
          urlSlug: input.urlSlug
        },
        fn.errorMessage
      )
    );
    await fn.handleSearchQuery(
      tournamentRepository.syncTournament({
        acronym: input.acronym,
        deletedAt: null,
        id: tournament.id,
        name: input.name,
        publishedAt: null,
        urlSlug: input.urlSlug
      })
    );
    return tournament;
  }

  public async updateTournament(
    db: DatabaseClient,
    input: TournamentValidationOutput['UpdateTournament'],
    payload: {
      tournamentId: number;
      userId: number;
    }
  ) {
    const { tournamentId, userId } = payload;

    const existingTournament = await tournamentRepository.getTournament(db, tournamentId, {
      hostUserId: true,
      playerRegsClosedAt: true,
      playerRegsOpenedAt: true,
      staffRegsClosedAt: true,
      staffRegsOpenedAt: true,
      concludedAt: true,
      publishedAt: true
    });

    if (!existingTournament) {
      throw new HTTPException(404, {
        message: 'Tournament does not exist'
      });
    }

    const fn = this.createServiceFunction('Failed to update tournament');

    const { hostUserId, ...dates } = existingTournament;

    this.validateTournamentUpdateFields(input, userId, hostUserId);

    await fn.validate(tournamentDynamicValidation.updateTournament(dates), 'tournament', input);

    await fn.handleDbQuery(tournamentRepository.updateTournament(db, input, tournamentId));
  }

  public async delegateHost(
    db: DatabaseClient,
    data: {
      oldHostUserId: number;
      newHostUserId: number;
      tournamentId: number;
    }
  ) {
    const fn = this.createServiceFunction('Failed to delegate host');

    const { oldHostUserId, newHostUserId, tournamentId } = data;

    const tournament = await tournamentRepository.getTournament(db, tournamentId, {
      id: true,
      hostUserId: true
    });

    if (!tournament) {
      throw new HTTPException(404, {
        message: 'Tournament does not exist'
      });
    }

    if (tournament.hostUserId !== oldHostUserId) {
      throw new HTTPException(400, {
        message: 'Only the host can delegate to another host'
      });
    }

    if (oldHostUserId === newHostUserId) {
      throw new HTTPException(400, {
        message: 'Cannot delegate host to the same user'
      });
    }

    const newHost = await userRepository.getUser(db, newHostUserId, {
      banned: true,
      approvedHost: true
    });

    if (!newHost) {
      throw new HTTPException(404, {
        message: 'User does not exist'
      });
    }

    if (newHost.banned) {
      throw new HTTPException(400, {
        message: 'Cannot delegate host to a banned user'
      });
    }

    if (!newHost.approvedHost) {
      throw new HTTPException(400, {
        message: 'Cannot delegate host to a non-approved host'
      });
    }

    await fn.handleDbQuery(
      tournamentRepository.changeTournamentHost(db, newHostUserId, tournamentId)
    );
  }

  public async deleteTournament(
    db: DatabaseClient,
    tournamentId: number,
    userId: number,
    deleteInstantly = false
  ) {
    const fn = this.createServiceFunction('Failed to delete tournament');
    const tournament = await tournamentRepository.getTournament(db, tournamentId, {
      id: true,
      hostUserId: true
    });

    if (!tournament) {
      throw new HTTPException(404, {
        message: 'Tournament does not exist'
      });
    }

    if (tournament.hostUserId !== userId) {
      throw new HTTPException(403, {
        message: 'Only host can delete the tournament'
      });
    }

    const deleteAt = deleteInstantly
      ? undefined
      : new Date(new Date().setHours(new Date().getHours() + 24));

    await fn.handleDbQuery(tournamentRepository.softDeleteTournament(db, tournamentId, deleteAt));
  }

  private handleTournamentCreationError(
    tournament: { name: string; urlSlug: string },
    descriptionIfUnknownError: string
  ) {
    return (err: unknown): never => {
      if (isUniqueConstraintViolationError(err, [Tournament.urlSlug])) {
        throw new HTTPException(409, {
          message: `Tournament with URL slug ${tournament.urlSlug} already exists`
        });
      }

      if (isUniqueConstraintViolationError(err, [Tournament.name])) {
        throw new HTTPException(409, {
          message: `Tournament with name ${tournament.name} already exists`
        });
      }

      unknownError(descriptionIfUnknownError)(err);
      return undefined as never;
    };
  }

  private validateTournamentUpdateFields(
    input: TournamentValidationOutput['UpdateTournament'],
    userId: number,
    hostUserId: number | null
  ) {
    const updatedFields = new Set(
      Object.keys(input) as (keyof TournamentValidationOutput['UpdateTournament'])[]
    );

    const hasRestrictedFields = updatedFields.intersection(this.HOST_RESTRICTED_FIELDS).size !== 0;

    if (hasRestrictedFields && userId !== hostUserId) {
      throw new HTTPException(403, {
        message: 'Input contains fields restricted to hosts'
      });
    }
  }
}

export const tournamentService = new TournamentService();
