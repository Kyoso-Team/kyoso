import { eq, sql } from 'drizzle-orm';
import * as v from 'valibot';
import { Tournament } from '$src/schema';
import { meilisearch } from '$src/singletons/meilisearch.ts';
import { pick } from '$src/utils/query';
import type { DatabaseClient, MeilisearchTournamentIndex } from '$src/types';
import type { TournamentValidation } from './validation';

class TournamentRepository {
  public async createTournament(
    db: DatabaseClient,
    tournament: v.InferOutput<(typeof TournamentValidation)['CreateTournament']>
  ) {
    return await db
      .insert(Tournament)
      .values(tournament)
      .returning(
        pick(Tournament, {
          id: true
        })
      )
      .then((rows) => rows[0]);
  }

  public async updateTournament(
    db: DatabaseClient,
    tournament: v.InferOutput<(typeof TournamentValidation)['UpdateTournament']>,
    tournamentId: number
  ) {
    return db.update(Tournament).set(tournament).where(eq(Tournament.id, tournamentId));
  }

  public async changeTournamentHost(
    db: DatabaseClient,
    hostUserId: v.InferOutput<(typeof TournamentValidation)['CreateTournament']>['hostUserId'],
    tournamentId: number
  ) {
    return db.update(Tournament).set({ hostUserId }).where(eq(Tournament.id, tournamentId));
  }

  public async softDeleteTournament(db: DatabaseClient, tournamentId: number, scheduleAt?: Date) {
    return db
      .update(Tournament)
      .set({ deletedAt: scheduleAt ?? sql`now()` })
      .where(eq(Tournament.id, tournamentId));
  }

  public async restoreTournament(db: DatabaseClient, tournamentId: number) {
    return db.update(Tournament).set({ deletedAt: null }).where(eq(Tournament.id, tournamentId));
  }

  public async syncTournament(tournament: MeilisearchTournamentIndex) {
    const index = meilisearch.index<MeilisearchTournamentIndex>('tournaments');
  
    await index.updateDocuments([tournament]);
  }
}

export const tournamentRepository = new TournamentRepository();
