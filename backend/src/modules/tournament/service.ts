import { HTTPException } from 'hono/http-exception';
import { Tournament } from '$src/schema';
import { isUniqueConstraintViolationError, unknownError } from '$src/utils/error';
import { Service } from '$src/utils/service';
import { userRepository } from '../user/user.repository';
import { tournamentRepository } from './tournament.repository';
import type { DatabaseClient } from '$src/types';
import type { TournamentValidationInput, TournamentValidationOutput } from './validation';

class TournamentService extends Service {
  private HOST_RESTRICTED_FIELDS = new Set<keyof TournamentValidationOutput['UpdateTournament']>([
    'name',
    'urlSlug',
    'acronym',
    'description',
    'teamSize',
    'useTeamBanners',
    'rankRange',
    'bws'
  ]);
  private DISALLOW_UPDATE_AFTER_START_DATE = new Set<
    keyof TournamentValidationOutput['UpdateTournament']
  >(['teamSize', 'useTeamBanners', 'rankRange', 'bws']);
  private TEAM_TOURNAMENT_FIELDS = new Set<keyof TournamentValidationOutput['UpdateTournament']>([
    'teamSize',
    'useTeamBanners'
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
      this.handleTournamentMutationError(
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
      publishedAt: true,
      type: true
    });

    if (!existingTournament) {
      throw new HTTPException(404, {
        message: 'Tournament does not exist'
      });
    }

    if (userId !== existingTournament.hostUserId) {
      throw new HTTPException(401, {
        message: "You're not this tournament's host"
      });
    }

    const fn = this.createServiceFunction('Failed to update tournament');

    const { hostUserId, type, ...dates } = existingTournament;
    this.validateTournamentUpdateFields(input, dates, type, userId, hostUserId);

    await fn.handleDbQuery(
      tournamentRepository.updateTournament(db, input, tournamentId),
      this.handleTournamentMutationError(
        {
          name: input.name,
          urlSlug: input.urlSlug
        },
        fn.errorMessage
      )
    );
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

  public async checkTournamentAvailability(db: DatabaseClient, tournamentId: number) {
    const tournament = await tournamentRepository.getTournament(db, tournamentId, {
      deletedAt: true,
      concludedAt: true
    });

    if (!tournament) {
      throw new HTTPException(404, {
        message: 'Tournament does not exist'
      });
    }

    const now = new Date();

    const tournamentDeleted = tournament.deletedAt && tournament.deletedAt <= now;
    const tournamentConcluded = tournament.concludedAt && tournament.concludedAt <= now;

    return !(tournamentConcluded || tournamentDeleted);
  }

  private handleTournamentMutationError(
    tournament: { name: string | undefined; urlSlug: string | undefined },
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
    currentDates: Pick<
      (typeof Tournament)['$inferSelect'],
      | 'publishedAt'
      | 'concludedAt'
      | 'playerRegsOpenedAt'
      | 'playerRegsClosedAt'
      | 'staffRegsOpenedAt'
      | 'staffRegsClosedAt'
    >,
    tournamentType: TournamentValidationOutput['CreateTournament']['type'],
    userId: number,
    hostUserId: number | null
  ) {
    const updatedFields = new Set(
      Object.keys(input) as (keyof TournamentValidationOutput['UpdateTournament'])[]
    );

    let hasRestrictedFields = updatedFields.intersection(this.HOST_RESTRICTED_FIELDS).size !== 0;

    if (hasRestrictedFields && userId !== hostUserId) {
      throw new HTTPException(401, {
        message: 'Input contains fields restricted to hosts'
      });
    }

    const published =
      (!!input.schedule?.publishedAt && Date.now() > input.schedule.publishedAt.getTime()) ||
      (!!currentDates.publishedAt && Date.now() > currentDates.publishedAt.getTime());
    hasRestrictedFields =
      updatedFields.intersection(this.DISALLOW_UPDATE_AFTER_START_DATE).size !== 0;

    if (published && hasRestrictedFields) {
      throw new HTTPException(403, {
        message: `Can't update the following fields after tournament is published: ${Array.from(
          this.DISALLOW_UPDATE_AFTER_START_DATE
        )
          .map((field) => `'${field}'`)
          .join(', ')}`
      });
    }

    if (
      input.schedule &&
      Object.values(input.schedule).some((date) => date !== null && Date.now() > date.getTime())
    ) {
      throw new HTTPException(400, {
        message: "Can't set a date in the past"
      });
    }

    const now = Date.now();
    const updatingSetDateToPast = !!Object.entries(currentDates)
      .filter(([_, date]) => date !== null)
      .find(([key, currentDate]) => {
        const newDate = input.schedule?.[
          key as keyof TournamentValidationOutput['UpdateTournament']['schedule']
        ] as Date | null | undefined;
        return (
          newDate !== undefined &&
          newDate !== null &&
          currentDate !== null &&
          newDate.getTime() !== currentDate.getTime() &&
          now > currentDate.getTime()
        );
      });

    if (updatingSetDateToPast) {
      throw new HTTPException(403, {
        message: "Can't update an already set date that is in the past"
      });
    }

    hasRestrictedFields = updatedFields.intersection(this.TEAM_TOURNAMENT_FIELDS).size !== 0;

    if (tournamentType === 'solo' && hasRestrictedFields) {
      throw new HTTPException(403, {
        message: "Can't update the team settings for a solo tournament"
      });
    }

    if (tournamentType !== 'solo' && input.teamSize === null) {
      throw new HTTPException(403, {
        message: "Can't delete team settings for a team-based tournament"
      });
    }
  }
}

export const tournamentService = new TournamentService();
