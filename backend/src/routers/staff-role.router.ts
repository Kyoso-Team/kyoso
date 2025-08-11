import { StaffRoleService } from '$src/modules/staff-role/staff-role.service';
import { initServices, t } from './_base/common';
import { createTournamentRouter } from './_base/tournament-router';

const BaseStaffRoleType = t.Object({
  name: t.String({
    minLength: 1
  }),
  color: t.UnionEnum([
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
  ])
});

export const staffRoleRouter = createTournamentRouter({
  prefix: '/staff/role'
})
  .use(initServices({
    staffRoleService: StaffRoleService
  }))
  .guard({
    session: true,
    staffMember: {
      permissions: ['manage_tournament']
    },
    tournament: {
      deleted: false,
      concluded: false
    }
  })
  .post('/', async ({ body, tournament, staffRoleService }) => {
    return await staffRoleService.createStaffRole({
      ...body,
      tournamentId: tournament.id
    });
  }, {
    body: BaseStaffRoleType
  })
  .patch('/:staff_role_id', async ({ params, body, tournament, staffRoleService }) => {
    await staffRoleService.updateStaffRole(
      params.staff_role_id,
      tournament.id,
      body
    );
  }, {
    params: t.Object({
      staff_role_id: t.IntegerIdString()
    }),
    body: t.Partial(
      t.Object({
        ...BaseStaffRoleType.properties,
        permissions: t.Array(
          t.UnionEnum([
            'manage_tournament',
            'manage_assets',
            'manage_theme',
            'manage_regs',
            'manage_pool_structure',
            'view_pool_suggestions',
            'create_pool_suggestions',
            'delete_pool_suggestions',
            'view_pooled_maps',
            'manage_pooled_maps',
            'view_feedback',
            'can_playtest',
            'can_submit_replays',
            'view_matches',
            'manage_matches',
            'ref_matches',
            'commentate_matches',
            'stream_matches',
            'manage_stats',
            'can_play'
          ])
        )
      })
    ),
    nonEmptyBody: true
  })
  .patch('/order', async ({ body, tournament, staffRoleService }) => {
    await staffRoleService.swapStaffRoles(
      body.staffRoleId1,
      body.staffRoleId2,
      tournament.id
    );
  }, {
    body: t.Object({
      staffRoleId1: t.IntegerId(),
      staffRoleId2: t.IntegerId()
    })
  })
  .delete('/:staff_role_id', async ({ params, tournament, staffRoleService }) => {
    await staffRoleService.deleteStaffRole(
      params.staff_role_id,
      tournament.id
    );
  }, {
    params: t.Object({
      staff_role_id: t.IntegerIdString()
    })
  });
