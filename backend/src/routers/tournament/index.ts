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
  .patch(
    '/:tournamentId',
    sessionMiddleware(),
    vValidator(
      'param',
      v.object({
        tournamentId: s.stringToInteger()
      })
    ),
    vValidator('json', TournamentValidation.UpdateTournament),
    async (c) => {
      const { tournamentId } = c.req.valid('param');
      const body = c.req.valid('json');

      await tournamentService.updateTournament(db, body, {
        tournamentId,
        userId: c.get('user').id
      });

      return c.json({
        message: 'Tournament updated successfully'
      });
    }
  )
  .put(
    '/:tournamentId/delegate_host',
    sessionMiddleware(),
    vValidator(
      'param',
      v.object({
        tournamentId: s.stringToInteger()
      })
    ),
    vValidator(
      'json',
      v.object({
        newHostUserId: s.integerId()
      })
    ),
    async (c) => {
      const { tournamentId } = c.req.valid('param');
      const body = c.req.valid('json');

      await tournamentService.delegateHost(db, {
        tournamentId,
        newHostUserId: body.newHostUserId,
        oldHostUserId: c.get('user').id
      });

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
        tournamentId: s.stringToInteger()
      })
    ),
    vValidator(
      'query',
      v.optional(
        v.object({
          instantDelete: s.stringToBoolean()
        })
      )
    ),
    async (c) => {
      const { tournamentId } = c.req.valid('param');
      const query = c.req.valid('query');

      const userId = c.get('user').id;

      await tournamentService.deleteTournament(db, tournamentId, userId, query?.instantDelete);

      return c.json({
        message: 'Tournament deleted successfully'
      });
    }
  );

export { tournamentRouter };
