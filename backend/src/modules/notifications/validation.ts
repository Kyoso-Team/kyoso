import * as v from 'valibot';
import * as s from '$src/utils/validation';

function createSchema<
  TLiteral extends string,
  TVersion extends number,
  TData extends v.ObjectSchema<any, any> = v.ObjectSchema<{}, undefined>,
>(
  literal: TLiteral,
  version: TVersion,
  data?: TData
) {
  return v.object({
    sentAt: v.optional(v.date()),
    event: v.literal(literal),
    eventVersion: v.optional(v.literal(version), version),
    data: (data ?? v.object({})) as TData
  });
}

const Welcome = createSchema('welcome', 1);

const UserUpdatedAdminStatus = createSchema('user_updated_admin_status', 1, v.object({
  status: v.union([v.literal('granted'), v.literal('removed')])
}));

const UserUpdatedApprovedHostStatus = createSchema('user_updated_approved_host_status', 1, v.object({
  status: v.union([v.literal('granted'), v.literal('removed')])
}));

const TournamentDateHasCome = createSchema('tournament_date_has_come', 1, v.object({
  tournamentId: s.integerId(),
  event: v.union([v.literal('published'), v.literal('concluded'), v.literal('player-regs-opened'), v.literal('player_regs_closed'), v.literal('staff_regs_opened'), v.literal('staff_regs_closed')])
}));

const CreateNotification = v.union([
  Welcome,
  UserUpdatedAdminStatus,
  UserUpdatedApprovedHostStatus,
  TournamentDateHasCome
]);

export const NotificationsValidation = { CreateNotification, Welcome, UserUpdatedAdminStatus, UserUpdatedApprovedHostStatus, TournamentDateHasCome };
