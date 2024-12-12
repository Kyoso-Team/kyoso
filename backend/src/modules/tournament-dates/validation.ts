import * as v from 'valibot';
import * as s from '$src/utils/validation';

function dateIsBefore(date: number, before: number[]) {
  return before.every((d) => date <= d);
}

function dateIsAfter(date: number, after: number[]) {
  return after.every((d) => date >= d);
}

const CreateTournamentDates = v.object({
  tournamentId: s.integerId()
});

const UpdateTournamentDates = v.pipe(
  v.record(
    v.union([
      v.literal('publishedAt'),
      v.literal('concludedAt'),
      v.literal('playerRegsOpenedAt'),
      v.literal('playerRegsClosedAt'),
      v.literal('staffRegsOpenedAt'),
      v.literal('staffRegsClosedAt')
    ]),
    v.date()
  ),
  v.transform(
    (input) =>
      Object.fromEntries(
        Object.entries(input).map(([key, value]) => [key, value.getTime()])
      ) as Record<keyof typeof input, number>
  ),
  v.check(
    (input) =>
      dateIsBefore(input.publishedAt, [
        input.playerRegsOpenedAt,
        input.playerRegsClosedAt,
        input.staffRegsOpenedAt,
        input.staffRegsClosedAt,
        input.concludedAt
      ]),
    'Invalid publish date: Expected it to be before all other dates'
  ),
  v.check(
    (input) =>
      dateIsBefore(input.playerRegsOpenedAt, [input.playerRegsClosedAt, input.concludedAt]) &&
      dateIsAfter(input.playerRegsOpenedAt, [input.publishedAt]),
    'Invalid player registrations opening date: Expected it to be before player regisrations closing date and conclusion date, and after publish date'
  ),
  v.check(
    (input) =>
      dateIsBefore(input.staffRegsOpenedAt, [input.staffRegsClosedAt, input.concludedAt]) &&
      dateIsAfter(input.staffRegsOpenedAt, [input.publishedAt]),
    'Invalid staff registrations opening date: Expected it to be before staff regisrations closing date and conclusion date, and after publish date'
  ),
  v.check(
    (input) =>
      dateIsBefore(input.playerRegsClosedAt, [input.concludedAt]) &&
      dateIsAfter(input.playerRegsClosedAt, [input.publishedAt, input.playerRegsOpenedAt]),
    'Invalid player registrations closing date: Expected it to be before conclusion date, and after publish date and player regisrations opening date'
  ),
  v.check(
    (input) =>
      dateIsBefore(input.staffRegsClosedAt, [input.concludedAt]) &&
      dateIsAfter(input.staffRegsClosedAt, [input.publishedAt, input.staffRegsOpenedAt]),
    'Invalid staff registrations closing date: Expected it to be before conclusion date, and after publish date and staff regisrations opening date'
  ),
  v.check(
    (input) =>
      dateIsAfter(input.concludedAt, [
        input.publishedAt,
        input.playerRegsOpenedAt,
        input.playerRegsClosedAt,
        input.staffRegsOpenedAt,
        input.staffRegsClosedAt
      ]),
    'Invalid conclusion date: Expected it to be after all other dates'
  ),
  v.transform(
    (input) =>
      Object.fromEntries(
        Object.entries(input).map(([key, value]) => [key, value ? new Date(value) : null])
      ) as Record<keyof typeof input, Date | null>
  )
);

export const TournamentDatesValidation = {
  CreateTournamentDates,
  UpdateTournamentDates
};
