import { and, eq, isNotNull, isNull, lt, or, sql } from 'drizzle-orm';
import * as v from 'valibot';
import { Tournament } from '$src/schema';
import { pick } from '$src/utils/query';
import { DbRepository } from '../_base/db-repository';
import { SearchRepository } from '../_base/search-repository';
import type { DatabaseClient } from '$src/types';
import type { TournamentValidation } from './validation';

class TournamentDbRepository extends DbRepository {
  public createTournament(
    db: DatabaseClient,
    tournament: v.InferOutput<(typeof TournamentValidation)['CreateTournament']>
  ) {
    const query = db
      .insert(Tournament)
      .values(tournament)
      .returning(
        pick(Tournament, {
          id: true
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
    tournament: Partial<typeof Tournament.$inferInsert>,
    tournamentId: number
  ) {
    const query = db
      .update(Tournament)
      .set(tournament)
      .where(
        and(
          eq(Tournament.id, tournamentId),
          or(
            isNull(Tournament.deletedAt),
            and(isNotNull(Tournament.deletedAt), lt(Tournament.deletedAt, sql`now()`))
          )
        )
      );

    return this.wrap({
      query,
      name: 'Update tournament'
    });
  }

  public changeTournamentHost(db: DatabaseClient, hostUserId: number, tournamentId: number) {
    const query = db.update(Tournament).set({ hostUserId }).where(eq(Tournament.id, tournamentId));

    return this.wrap({
      query,
      name: 'Change tournament host'
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

  public getTournament(db: DatabaseClient, tournamentId: number) {
    const query = db
      .select(
        pick(Tournament, {
          hostUserId: true,
          playerRegsClosedAt: true,
          playerRegsOpenedAt: true,
          staffRegsClosedAt: true,
          staffRegsOpenedAt: true,
          concludedAt: true,
          publishedAt: true,
          deletedAt: true,
          type: true
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
