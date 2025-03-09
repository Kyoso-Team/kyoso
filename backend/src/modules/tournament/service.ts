import { HTTPException } from 'hono/http-exception';
import { Tournament } from '$src/schema';
import { isUniqueConstraintViolationError, unknownError } from '$src/utils/error';
import { Service } from '$src/utils/service';
import { userRepository } from '../user/repository';
import { tournamentRepository } from './repository';
import { TournamentValidation } from './validation';
import type { DatabaseClient } from '$src/types';
import type { TournamentValidationInput, TournamentValidationOutput } from './validation';

class TournamentService extends Service {
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
    input: TournamentValidationInput['CreateTournament']
  ) {
    const fn = this.createServiceFunction('Failed to create tournament');
    const data = await fn.validate(TournamentValidation.CreateTournament, 'tournament', input);
    const tournament = await fn.handleDbQuery(
      tournamentRepository.createTournament(db, data),
      this.handleTournamentCreationError(
        {
          name: data.name,
          urlSlug: data.urlSlug
        },
        fn.errorMessage
      )
    );
    await fn.handleSearchQuery(
      tournamentRepository.syncTournament({
        acronym: data.acronym,
        deletedAt: null,
        id: tournament.id,
        name: data.name,
        publishedAt: null,
        urlSlug: data.urlSlug
      })
    );
    return tournament;
  }

  public async updateTournament(
    db: DatabaseClient,
    input: TournamentValidationInput['UpdateTournament'],
    payload: {
      tournamentId: number;
      userId: number;
    }
  ) {
    const { tournamentId, userId } = payload;

    const fn = this.createServiceFunction('Failed to update tournament');
    const data = await fn.validate(TournamentValidation.UpdateTournament, 'tournament', input);

    const existingTournament = await tournamentRepository.getTournament(db, tournamentId, {
      id: true,
      playerRegsOpenedAt: true,
      playerRegsClosedAt: true,
      staffRegsOpenedAt: true,
      staffRegsClosedAt: true,
      hostUserId: true
    });

    if (!existingTournament) {
      throw new HTTPException(404, {
        message: 'Tournament does not exist'
      });
    }

    if (userId !== existingTournament.hostUserId) {
      throw new HTTPException(403, {
        message: 'Only host can update the tournament'
      });
    }

    if (data.schedule) {
      this.checkTournamentDates(existingTournament, data.schedule);
    }

    await fn.handleDbQuery(tournamentRepository.updateTournament(db, data, tournamentId));
  }

  public async delegateHost(db: DatabaseClient, tournamentId: number, hostId: number) {
    const fn = this.createServiceFunction('Failed to delegate host');
    const tournament = await tournamentRepository.getTournament(db, tournamentId, {
      id: true,
      hostUserId: true
    });

    if (!tournament) {
      throw new HTTPException(404, {
        message: 'Tournament does not exist'
      });
    }

    if (tournament.hostUserId === hostId) {
      throw new HTTPException(400, {
        message: 'Cannot assign the same host'
      });
    }

    const newHost = await userRepository.getUser(db, hostId, {
      banned: true
    });

    if (!newHost) {
      throw new HTTPException(404, {
        message: 'User does not exist'
      });
    }

    if (newHost.banned) {
      throw new HTTPException(400, {
        message: 'Cannot delegate to a banned user'
      });
    }

    await fn.handleDbQuery(tournamentRepository.changeTournamentHost(db, hostId, tournamentId));
  }

  public async deleteTournament(db: DatabaseClient, tournamentId: number, userId: number, deleteInstantly = false) {
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

    const deleteAt = deleteInstantly ? undefined : new Date(new Date().setHours(new Date().getHours() + 24));

    await fn.handleDbQuery(tournamentRepository.softDeleteTournament(db, tournamentId, deleteAt));
  }

  private checkTournamentDates(
    tournamentDates: Pick<
      typeof Tournament.$inferSelect,
      'playerRegsOpenedAt' | 'staffRegsClosedAt' | 'playerRegsClosedAt' | 'staffRegsOpenedAt'
    >,
    newDates: TournamentValidationOutput['UpdateTournamentSchedule']
  ) {
    //TODO: implement date validation logic
    return true;
  }

  private handleTournamentCreationError(
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
}

export const tournamentService = new TournamentService();
