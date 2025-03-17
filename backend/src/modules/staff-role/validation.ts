import * as v from 'valibot';
import { StaffPermission } from '$src/schema';
import * as s from '$src/utils/validation';
import type { MapInput, MapOutput } from '$src/types';

export abstract class StaffRoleValidation {
  public static BaseMutateStaffRole = v.object({
    name: s.nonEmptyString(),
    color: v.optional(
      v.picklist([
        'slate',
        'gray',
        'red',
        'orange',
        'yellow',
        'lime',
        'green',
        'emerald',
        'cyan',
        'blue',
        'indigo',
        'purple',
        'fuchsia',
        'pink'
      ]),
      'slate'
    ),
    tournamentId: s.integerId()
  });

  public static CreateStaffRole = v.object({
    ...this.BaseMutateStaffRole.entries
  });

  public static UpdateStaffRole = v.object({
    ...v.pick(this.BaseMutateStaffRole, ['tournamentId']).entries,
    ...v.partial(
      v.object({
        ...v.omit(this.BaseMutateStaffRole, ['tournamentId']).entries,
        permissions: v.array(v.picklist(StaffPermission.enumValues))
      })
    ).entries
  });

  public static SwapStaffRoles = v.object({
    tournamentId: s.integerId(),
    targetStaffRoleId: s.integerId()
  });
}

export type StaffRoleValidationInput = MapInput<typeof StaffRoleValidation>;
export type StaffRoleValidationOutput = MapOutput<typeof StaffRoleValidation>;
