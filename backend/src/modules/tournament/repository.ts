import { eq, sql } from 'drizzle-orm';
import * as v from 'valibot';
import { Tournament } from '$src/schema';
import { meilisearch } from '$src/singletons/meilisearch.ts';
import { pick } from '$src/utils/query';
import type { DatabaseClient, MeilisearchTournamentIndex, MeilisearchUserIndex } from '$src/types';
import type { TournamentValidation } from './validation';

async function createTournament(
  db: DatabaseClient,
  tournament: v.InferOutput<(typeof TournamentValidation)['CreateTournament']>
) {
  const result = await db
    .insert(Tournament)
    .values(tournament)
    .returning(
      pick(Tournament, {
        id: true,
        acronym: true,
        name: true,
        urlSlug: true
      })
    )
    .then((rows) => rows[0]);

  syncTournament({
    ...result,
    deletedAt: null,
    publishedAt: null
  });

  return {
    id: result.id
  };
}

async function updateTournament(
  db: DatabaseClient,
  tournament: v.InferOutput<(typeof TournamentValidation)['UpdateTournament']>,
  tournamentId: number
) {
  return db.update(Tournament).set(tournament).where(eq(Tournament.id, tournamentId));
}

async function changeTournamentType(
  db: DatabaseClient,
  type: v.InferOutput<(typeof TournamentValidation)['CreateTournament']>['type'],
  tournamentId: number
) {
  return db.update(Tournament).set({ type }).where(eq(Tournament.id, tournamentId));
}

async function changeTournamentHost(
  db: DatabaseClient,
  hostUserId: v.InferOutput<(typeof TournamentValidation)['CreateTournament']>['hostUserId'],
  tournamentId: number
) {
  return db.update(Tournament).set({ hostUserId }).where(eq(Tournament.id, tournamentId));
}

async function softDeleteTournament(db: DatabaseClient, tournamentId: number, scheduleAt?: Date) {
  return db
    .update(Tournament)
    .set({ deletedAt: scheduleAt ?? sql`now()` })
    .where(eq(Tournament.id, tournamentId));
}

async function restoreTournament(db: DatabaseClient, tournamentId: number) {
  return db.update(Tournament).set({ deletedAt: null }).where(eq(Tournament.id, tournamentId));
}

async function syncTournament(tournament: MeilisearchTournamentIndex) {
  const index = meilisearch.index<MeilisearchTournamentIndex>('tournaments');

  await index.updateDocuments([tournament]);
}

export const tournamentRepository = {
  createTournament,
  updateTournament,
  changeTournamentType,
  changeTournamentHost,
  softDeleteTournament,
  restoreTournament,
  syncTournament
};
