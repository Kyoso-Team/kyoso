import { Tournament } from '$src/schema';
import { pick } from '$src/utils/query';
import { DbRepository } from '../_base/db-repository';
import { SearchRepository } from '../_base/search-repository';
import type { DatabaseClient } from '$src/types';
import { eq, sql } from 'drizzle-orm';

class TournamentDbRepository extends DbRepository {
  public createTournament(
    db: DatabaseClient,
    tournament: typeof Tournament.$inferInsert
  ) {
    const query = db
      .insert(Tournament)
      .values(tournament)
      .returning(
        pick(Tournament, {
          id: true,
          urlSlug: true
        })
      );

    return this.wrap({
      query,
      name: 'Create tournament',
      map: this.map.firstRow
    });
  }

  public updateTournament(
    db: DatabaseClient,
    tournamentId: number,
    tournament: Omit<Partial<typeof Tournament.$inferInsert>, 'deletedAt'>
  ) {
    const query = db
      .update(Tournament)
      .set(tournament)
      .where(eq(Tournament.id, tournamentId))
      .returning(
        pick(Tournament, {
          name: true,
          acronym: true,
          urlSlug: true,
          publishedAt: true,
          deletedAt: true
        })
      );

    return this.wrap({
      query,
      name: 'Update tournament',
      map: this.map.firstRow
    });
  }

  public softDeleteTournament(db: DatabaseClient, tournamentId: number, scheduleAt?: Date) {
    const query = db
      .update(Tournament)
      .set({ deletedAt: scheduleAt ?? sql`now()` })
      .where(eq(Tournament.id, tournamentId));

    return this.wrap({
      query,
      name: 'Soft delete tournament'
    });
  }

  public restoreTournament(db: DatabaseClient, tournamentId: number) {
    const query = db
      .update(Tournament)
      .set({ deletedAt: null })
      .where(eq(Tournament.id, tournamentId));

    return this.wrap({
      query,
      name: 'Restore tournament'
    });
  }

  public deleteTournament(db: DatabaseClient, tournamentId: number) {
    const query = db
      .delete(Tournament)
      .where(eq(Tournament.id, tournamentId));

    return this.wrap({
      query,
      name: 'Delete tournament'
    });
  }

  public getTournament(db: DatabaseClient, tournamentId: number) {
    const query = db
      .select(
        pick(Tournament, {
          id: true,
          playerRegsClosedAt: true,
          playerRegsOpenedAt: true,
          staffRegsClosedAt: true,
          staffRegsOpenedAt: true,
          concludedAt: true,
          publishedAt: true,
          deletedAt: true,
          type: true,
          bws: true,
          lowerRankRange: true,
          upperRankRange: true,
          minTeamSize: true,
          maxTeamSize: true,
          useTeamBanners: true,
          hostUserId: true
        })
      )
      .from(Tournament)
      .where(eq(Tournament.id, tournamentId))
      .limit(1);

    return this.wrap({
      query,
      name: 'Get tournament',
      map: this.map.firstRowOrNull
    });
  }
}

class TournamentSearchRepository extends SearchRepository {
  public updateTournamentDocs(tournament: SearchRepository['indexes']['tournament']['$document']) {
    return this.indexes.tournament.updateDocuments({
      name: 'Update tournament documents',
      input: [tournament]
    });
  }
}

class TournamentRepository {
  public db = new TournamentDbRepository();
  public search = new TournamentSearchRepository();
}

export const tournamentRepository = new TournamentRepository();
