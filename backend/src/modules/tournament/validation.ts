import * as v from 'valibot';
import { TournamentType } from '$src/schema';
import * as s from '$src/utils/validation';

const BwsValues = v.record(
  v.union([v.literal('x'), v.literal('y'), v.literal('z')]),
  v.pipe(v.number(), v.notValue(0), v.minValue(-10), v.maxValue(10))
);

const CreateTournament = v.object({
  name: v.pipe(v.string(), v.minLength(2), v.maxLength(50)),
  urlSlug: v.pipe(v.string(), v.minLength(2), v.maxLength(16), s.validUrlSlug()),
  acronym: v.pipe(v.string(), v.minLength(2), v.maxLength(8)),
  type: v.picklist(TournamentType.enumValues),
  hostUserId: s.integerId()
});

const CreateSoloTournament = v.object({
  ...v.omit(CreateTournament, ['type']).entries,
  type: v.literal(TournamentType.enumValues[0])
});

const CreateTeamsTournament = v.object({
  ...v.omit(CreateTournament, ['type']).entries,
  type: v.literal(TournamentType.enumValues[1])
});

const CreateDraftTournament = v.object({
  ...v.omit(CreateTournament, ['type']).entries,
  type: v.literal(TournamentType.enumValues[2])
});

const UpdateTournament = v.partial(v.omit(CreateTournament, ['type', 'hostUserId']));

export const TournamentValidation = {
  BwsValues,
  CreateTournament,
  CreateSoloTournament,
  CreateTeamsTournament,
  CreateDraftTournament,
  UpdateTournament
};
