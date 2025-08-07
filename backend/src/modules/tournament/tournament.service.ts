import { Tournament } from '$src/schema';
import { ExpectedError, isUniqueConstraintViolationError } from '$src/utils/error';
import { Service } from '$src/utils/service';
import { tournamentRepository } from './tournament.repository';
import { db } from '$src/singletons';
import { time } from '$src/utils';

export class TournamentService extends Service {
  // public async createDummyTournament(
  //   db: DatabaseClient,
  //   n: number,
  //   hostUserId: number,
  //   type: TournamentValidationInput['CreateTournament']['type'],
  //   teamSettings?: {
  //     minSize: number;
  //     maxSize: number;
  //     useBanners?: boolean;
  //   }
  // ) {
  //   this.checkTest();
  //   return this.createTournament(db, {
  //     acronym: `T${n}`,
  //     name: `Tournament ${n}`,
  //     urlSlug: `t${n}`,
  //     hostUserId,
  //     type,
  //     teamSize: teamSettings
  //       ? {
  //           min: teamSettings.minSize,
  //           max: teamSettings.maxSize
  //         }
  //       : undefined,
  //     useTeamBanners: teamSettings?.useBanners
  //   } as any);
  // }

  public async createTournament(tournament: typeof Tournament.$inferInsert) {
    const created = await this.execute(
      tournamentRepository.db.createTournament(db, tournament),
      this.handleTournamentMutationError(tournament)
    );

    await this.execute(
      tournamentRepository.search.updateTournamentDocs({
        ...tournament,
        id: created.id,
        deletedAt: null,
        publishedAt: null
      })
    );

    return created;
  }

  public async updateTournament(
    tournamentId: number,
    tournament: Partial<typeof Tournament.$inferInsert>
  ) {
    const updated = await this.execute(
      tournamentRepository.db.updateTournament(db, tournamentId, tournament),
      this.handleTournamentMutationError(tournament)
    );

    await this.execute(
      tournamentRepository.search.updateTournamentDocs({
        ...updated,
        id: tournamentId
      })
    );
  }

  public async deleteTournament(
    tournamentId: number,
    hardDelete?: boolean
  ) {
    await this.execute(
      hardDelete
      ? tournamentRepository.db.deleteTournament(db, tournamentId)
      : tournamentRepository.db.softDeleteTournament(db, tournamentId, new Date(Date.now() + time.days(1)))
    );
  }

  public async getTournament(tournamentId: number) {
    return await this.execute(tournamentRepository.db.getTournament(db ,tournamentId));
  }

  private handleTournamentMutationError(
    tournament: { name?: string | undefined; urlSlug?: string | undefined }
  ) {
    return (err: unknown): never => {
      if (isUniqueConstraintViolationError(err, [Tournament.urlSlug])) {
        throw new ExpectedError(409, `Tournament with URL slug "${tournament.urlSlug}" already exists`);
      }

      if (isUniqueConstraintViolationError(err, [Tournament.name])) {
        throw new ExpectedError(409, `Tournament with name "${tournament.name}" already exists`);
      }

      throw err;
    };
  }
}
