import * as v from 'valibot';
import * as s from '$src/utils/validation';
import { DraftOrderType, WinCondition } from '$src/schema';

const CreateRefereeSettings = v.object({
  tournamentId: s.integerId()
});

const UpdateRefereeSettings = v.partial(
  v.object({
    timers: v.record(
      v.union([v.literal('pick'), v.literal('ban'), v.literal('protect'), v.literal('ready'), v.literal('start')]),
      v.pipe(v.number(), v.minValue(0), v.maxValue(1500 /* 15 minutes */))
    ),
    bools: v.record(
      v.union([v.literal('doublePick'), v.literal('doubleBan'), v.literal('doubleProtect'), v.literal('banAndProtectCancelOut'), v.literal('forceNoFail')]),
      v.boolean()
    ),
    orders: v.record(
      v.union([v.literal('pick'), v.literal('ban'), v.literal('protect')]),
      v.picklist(DraftOrderType.enumValues)
    ),
    winCondition: v.picklist(WinCondition.enumValues)
  })
);

export const TournamentRefereeSettingsValidation = {
  CreateRefereeSettings,
  UpdateRefereeSettings
};
