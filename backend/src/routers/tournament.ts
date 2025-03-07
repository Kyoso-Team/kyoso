import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import * as v from 'valibot';
import { sessionMiddleware } from '$src/middlewares/session';
import { tournamentService } from '$src/modules/tournament/service.ts';
import { TournamentValidation } from '$src/modules/tournament/validation.ts';
import { db } from '$src/singletons';
import * as s from '$src/utils/validation';

const tournamentRouter = new Hono()
  .basePath('/tournament')
  .post(
    '/',
    sessionMiddleware({
      approvedHost: true
    }),
    vValidator('json', s.omitPiped(TournamentValidation.CreateTournament, ['hostUserId'])),
    async (c) => {
      const body = c.req.valid('json');
      const result = await tournamentService.createTournament(db, {
        ...body,
        hostUserId: c.get('user').id
      });

      return c.json({
        id: result.id
      });
    }
  )
  .patch('/:tournamentId', sessionMiddleware(), vValidator('param', s.integerId()), async (c) => {
    const { tournamentId } = c.req.param();
    const body = await c.req.json();

    await tournamentService.updateTournament(db, body, {
      tournamentId: parseInt(tournamentId),
      userId: c.get('user').id
    });

    return c.json({
      message: 'Tournament updated successfully'
    });
  })
  .patch(
    'delegate_host',
    sessionMiddleware(),
    vValidator(
      'json',
      v.object({
        tournamentId: s.integerId(),
        hostId: s.integerId()
      })
    ),
    async (c) => {
      const body = c.req.valid('json');

      await tournamentService.delegateHost(db, body.tournamentId, body.hostId);

      return c.json({
        message: 'Host changed successfully'
      });
    }
  )
  .delete(
    '/:tournamentId',
    sessionMiddleware(),
    vValidator(
      'param',
      v.object({
        tournamentId: s.integerId()
      })
    ),
    async (c) => {
      const { tournamentId } = c.req.valid('param');

      await tournamentService.deleteTournament(db, tournamentId);

      return c.json({
        message: 'Tournament deleted successfully'
      });
    }
  );

export { tournamentRouter };
