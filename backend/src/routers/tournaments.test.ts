import { beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { gte } from 'drizzle-orm';
import { databaseRepository } from '$src/modules/database/repository';
import { userService } from '$src/modules/user/service';
import { Tournament } from '$src/schema';
import { db } from '$src/singletons';
import { api, loginAs } from '$src/tests';

describe('post /tournament', () => {
  beforeAll(async () => {
    await databaseRepository.truncateTables(db);

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
        type: 'teams',
        acronym: 'test'
      }
    });

    expect(resp.status).toBe(401);
  });

  it.todo('duplicate name');

  it.todo('duplicate url slug');

  it('create teams tournament', async () => {
    const resp = await api.tournament.$post({
      json: {
        name: 'test',
        urlSlug: 'test',
        type: 'teams',
        acronym: 'test'
      }
    });

    expect(resp.status).toBe(200);
    expect(await resp.json()).toStrictEqual({
      id: expect.any(Number)
    });
  });

  it.todo('create solo tournament');

  it.todo('create draft tournament');
});

describe('patch /tournament/[...]', () => {
  it.todo("not the tournament's host");

  it.todo('insufficient staff permissions'); // Implement when staff permissions, roles and mambers are implemented

  it.todo('duplicate name');

  it.todo('duplicate url slug');

  it.todo(
    "can't udpate bws values, rank range or team sizes after tournament's player regs. have opened"
  );
});

describe('patch /tournament/teams', () => {
  it.todo('update tournament');
});

describe('patch /tournament/solo', () => {
  it.todo('update tournament');
});

describe('patch /tournament/draft', () => {
  it.todo('update tournament');
});

describe('put /tournament/change/type', () => {
  it.todo("not the tournament's host");

  it.todo("can't change type after tournament is published");

  // Some of these may be redundant but I'm unsure. Will leave these here for now
  it.todo('solo to teams');

  it.todo('solo to draft');

  it.todo('teams to solo');

  it.todo('teams to draft');

  it.todo('draft to solo');

  it.todo('draft to teams');
});

describe.todo('put /tournament/change/host');

describe.todo('delete /tournament');

describe.todo('patch /tournament/referee-settings');

describe.todo('patch /tournament/dates');

describe.todo('post /tournament/date');

describe.todo('patch /tournament/date');

describe.todo('delete /tournament/date');

describe.todo('post /tournament/link');

describe.todo('patch /tournament/link');

describe.todo('delete /tournament/link');

describe.todo('post /tournament/mod-multiplier');

describe.todo('patch /tournament/mod-multiplier');

describe.todo('delete /tournament/mod-multiplier');
