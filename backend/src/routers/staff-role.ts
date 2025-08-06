import { StaffRoleService } from '$src/modules/staff-role/staff-role.service';
import { initServices, t } from './_base/common';
import { createTournamentRouter } from './_base/tournament-router';

const BaseStaffRoleType = t.Object({
  name: t.String({
    minLength: 1
  }),
  color: t.Union([
    t.Literal('slate'),
    t.Literal('gray'),
    t.Literal('red'),
    t.Literal('orange'),
    t.Literal('yellow'),
    t.Literal('lime'),
    t.Literal('green'),
    t.Literal('emerald'),
    t.Literal('cyan'),
    t.Literal('blue'),
    t.Literal('indigo'),
    t.Literal('purple'),
    t.Literal('fuchsia'),
    t.Literal('pink')
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
          t.Union([
            t.Literal('manage_tournament'),
            t.Literal('manage_assets'),
            t.Literal('manage_theme'),
            t.Literal('manage_regs'),
            t.Literal('manage_pool_structure'),
            t.Literal('view_pool_suggestions'),
            t.Literal('create_pool_suggestions'),
            t.Literal('delete_pool_suggestions'),
            t.Literal('view_pooled_maps'),
            t.Literal('manage_pooled_maps'),
            t.Literal('view_feedback'),
            t.Literal('can_playtest'),
            t.Literal('can_submit_replays'),
            t.Literal('view_matches'),
            t.Literal('manage_matches'),
            t.Literal('ref_matches'),
            t.Literal('commentate_matches'),
            t.Literal('stream_matches'),
            t.Literal('manage_stats'),
            t.Literal('can_play')
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
