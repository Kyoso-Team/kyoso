import { beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { gte } from 'drizzle-orm';
import { truncateTables } from '$src/dev';
import { tournamentService } from '$src/modules/tournament/tournament.service';
import { userService } from '$src/modules/user/user.service';
import { Tournament } from '$src/schema';
import { db } from '$src/singletons';
import { expectResponse } from '$src/test';
import { api, loginAs } from '$src/tests';

describe('post /tournament', () => {
  beforeAll(async () => {
    await truncateTables();

    await userService.createDummyUser(db, 1, {
      approvedHost: true
    });
    await userService.createDummyUser(db, 2, {
      admin: true
    });
  });

  beforeEach(async () => {
    await loginAs(1);
    await db.delete(Tournament).where(gte(Tournament.id, 1));
  });

  it('not an approved host', async () => {
    await loginAs(2);
    const resp = await api.tournament.$post({
      json: {
        name: 'test',
        urlSlug: 'test',
        isOpenRank: false,
        type: 'solo',
        acronym: 'test'
      }
    });

    await expectResponse(resp).toEqual(401, 'error');
  });

  it('duplicate name', async () => {
    await tournamentService.createDummyTournament(db, 1, 2, 'solo');
    const resp = await api.tournament.$post({
      json: {
        name: 'Tournament 1',
        urlSlug: 'test',
        isOpenRank: false,
        type: 'solo',
        acronym: 'test'
      }
    });

    await expectResponse(resp).toEqual(409, 'error');
  });

  it('duplicate url slug', async () => {
    await tournamentService.createDummyTournament(db, 1, 2, 'solo');
    const resp = await api.tournament.$post({
      json: {
        name: 'test',
        urlSlug: 't1',
        isOpenRank: false,
        type: 'solo',
        acronym: 'test'
      }
    });

    await expectResponse(resp).toEqual(409, 'error');
  });

  it('create teams tournament', async () => {
    const resp = await api.tournament.$post({
      json: {
        name: 'test',
        urlSlug: 'test',
        type: 'teams',
        teamSize: {
          min: 2,
          max: 4
        },
        acronym: 'test',
        isOpenRank: false
      }
    });

    await expectResponse(resp).toEqual(200, {
      id: expect.any(Number)
    });
  });

  it.todo('create solo tournament');

  it.todo('create draft tournament');
});

// TODO: Move these elsewhere
// describe.todo('post /tournament/date');

// describe.todo('patch /tournament/date');

// describe.todo('delete /tournament/date');

// describe.todo('post /tournament/link');

// describe.todo('patch /tournament/link');

// describe.todo('delete /tournament/link');

// describe.todo('post /tournament/mod-multiplier');

// describe.todo('patch /tournament/mod-multiplier');

// describe.todo('delete /tournament/mod-multiplier');
