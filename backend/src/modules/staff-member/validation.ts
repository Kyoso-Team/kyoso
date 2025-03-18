import * as v from 'valibot';
import * as s from '$src/utils/validation';
import type { StaffMemberRole } from '$src/schema';
import type { MapInput, MapOutput } from '$src/types';

export class StaffMemberValidation {
  public static CreateStaffMember = v.object({
    userId: s.integerId(),
    tournamentId: s.integerId(),
    staffRoleIds: v.pipe(
      v.array(s.integerId()),
      v.checkItems(
        (item, index, array) => array.indexOf(item) === index,
        'Cannot assign the same staff role multiple times'
      )
    )
  });

  public static UpdateStaffMember = v.object({
    ...this.CreateStaffMember.entries
  });
}

export class StaffMemberDynamicValidation {
  public updateStaffMemberRoles(
    stored: Pick<typeof StaffMemberRole.$inferSelect, 'staffRoleId'>[]
  ) {
    return v.pipe(
      s.$assume<StaffMemberValidationOutput['UpdateStaffMember']>(),
      v.transform((i) => {
        const inputSet = new Set(i.staffRoleIds);
        const currentSet = new Set(stored.map((item) => item.staffRoleId));

        return {
          remove: [...currentSet.difference(inputSet)],
          add: [...inputSet.difference(currentSet)]
        };
      })
    );
  }
}

export const staffMemberDynamicValidation = new StaffMemberDynamicValidation();

export type StaffMemberValidationOutput = MapOutput<typeof StaffMemberValidation>;
export type StaffMemberValidationInput = MapInput<typeof StaffMemberValidation>;
