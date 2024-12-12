import { eq, sql } from 'drizzle-orm';
import * as v from 'valibot';
import { Tournament } from '$src/schema';
import type { DatabaseClient } from '$src/types';
import type { TournamentValidation } from './validation';

async function createSoloTournament(
  db: DatabaseClient,
  tournament: v.InferOutput<(typeof TournamentValidation)['CreateSoloTournament']>
) {
  return db
    .insert(Tournament)
    .values(tournament)
    .returning({ id: Tournament.id })
    .then((rows) => rows[0]);
}

async function createTeamsTournament(
  db: DatabaseClient,
  tournament: v.InferOutput<(typeof TournamentValidation)['CreateTeamsTournament']>
) {
  return db
    .insert(Tournament)
    .values(tournament)
    .returning({ id: Tournament.id })
    .then((rows) => rows[0]);
}

async function createDraftTournament(
  db: DatabaseClient,
  tournament: v.InferOutput<(typeof TournamentValidation)['CreateDraftTournament']>
) {
  return db
    .insert(Tournament)
    .values(tournament)
    .returning({ id: Tournament.id })
    .then((rows) => rows[0]);
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

export const tournamentRepository = {
  createSoloTournament,
  createTeamsTournament,
  createDraftTournament,
  updateTournament,
  changeTournamentType,
  changeTournamentHost,
  softDeleteTournament,
  restoreTournament
};
