import { StaffMemberService } from '$src/modules/staff-member/staff-member.service';
import { createTournamentRouter } from './_base/tournament-router';
import { initServices, t } from './_base/common';
import { StaffRoleService } from '$src/modules/staff-role/staff-role.service';
import { status } from 'elysia';

export const staffMemberRouter = createTournamentRouter({
  prefix: '/staff/member'
})
  .use(initServices({
    staffMemberService: StaffMemberService,
    staffRoleService: StaffRoleService
  }))
  .guard({
    session: true,
    tournament: {
      deleted: false,
      concluded: false
    }
  })
  .patch('/:staff_member_id/roles', async ({ params, body, staffMember, tournament, staffMemberService, staffRoleService }) => {
    const tournamentStaffRoles = await staffRoleService.getStaffRoles(tournament.id, {
      staffRoleIds: body.staffRoleIds
    });
    const allPermissions = tournamentStaffRoles.map(role => role.permissions).flat();

    const canStaffMemberManageTournament = staffMember.permissions.includes('manage_tournament');

    if (canStaffMemberManageTournament && !allPermissions.includes('manage_tournament') && !staffMember.host) {
      return status(401, 'Only the host can remove the "manage_tournament" permission from other staff members');
    }

    if (!canStaffMemberManageTournament && allPermissions.includes('manage_tournament') && !staffMember.host) {
      return status(401, 'You do not have permission to assign the "manage_tournament" permission to other staff members');
    }

    if (staffMember.id === params.staff_member_id && !staffMember.host) {
      return status(403, 'You cannot update your own roles unless you are the host');
    }

    const staffMemberToUpdate = await staffMemberService.getStaffMember({
      staffMemberId: params.staff_member_id,
      tournamentId: tournament.id
    });
    if (!staffMemberToUpdate) {
      return status(404, 'Staff member not found');
    }

    await staffMemberService.overrideStaffMemberRoles(
      staffMemberToUpdate.id,
      tournamentStaffRoles.map((role) => role.id)
    );
  }, {
    params: t.Object({
      staff_member_id: t.IntegerIdString()
    }),
    body: t.Object({
      staffRoleIds: t.Array(t.IntegerId())
    }),
    staffMember: {
      permissions: ['manage_tournament']
    }
  })
  .delete('/:staff_member_id/remove', async ({ params, staffMember, tournament, staffMemberService }) => {
    if (staffMember.id === params.staff_member_id) {
      return status(403, 'You cannot remove yourself from the staff team');
    }

    const staffMemberToRemove = await staffMemberService.getStaffMember({
      staffMemberId: params.staff_member_id,
      tournamentId: tournament.id
    });

    if (!staffMemberToRemove) {
      return status(404, 'Staff member not found');
    }

    if (staffMemberToRemove.userId === tournament.hostUserId) {
      return status(403, 'Tournament host cannot be removed from the tournament');
    }

    if (new Set(staffMemberToRemove.permissions).has('manage_tournament') && !staffMember.host) {
      return status(403, 'Can\'t remove staff member with the "manage_tournament" permission unless you are the host');
    }
    
    await staffMemberService.deleteStaffMember(staffMemberToRemove.id);
  }, {
    params: t.Object({
      staff_member_id: t.IntegerIdString()
    }),
    staffMember: {
      permissions: ['manage_tournament']
    }
  })
  .delete('/leave', async ({ staffMember, staffMemberService }) => {
    if (staffMember.host) {
      return status(403, 'Host cannot leave their own tournament');
    }

    await staffMemberService.deleteStaffMember(staffMember.id);
  }, {
    staffMember: true
  });
