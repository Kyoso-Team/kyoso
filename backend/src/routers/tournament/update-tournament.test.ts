import { describe, it } from 'bun:test';

describe('patch /tournament/:tournamentId', () => {
  it.todo("not the tournament's host");

  it.todo('insufficient staff permissions'); // Implement when staff permissions, roles and mambers are implemented

  it.todo('duplicate name');

  it.todo('duplicate url slug');

  it.todo("can't update 'publishedAt' or 'type' after tournament's published");

  it.todo("can't update 'playerRegsOpenedAt' after tournament's player regs. have opened");

  it.todo(
    "can't udpate 'bws', 'lowerRankRange', 'upperRankRange', 'minTeamSize', 'maxTeamSize', 'useTeamBanners' or 'playerRegsClosedAt' after tournament's player regs. have closed"
  );

  it.todo("can't update 'staffRegsOpenedAt' after tournament's staff regs. have opened");

  it.todo("can't update 'staffRegsClosedAt' after tournament's staff regs. have closed");

  it.todo(
    "can't update 'minTeamSize', 'maxTeamSize' or 'useTeamBanners' if it's a solo tournament"
  );

  it.todo("can't set a tournament date in the past");

  it.todo("can't set a tournament date to a date before the one already set");

  it.todo("team-based tournament can't unset team settings");

  it.todo("solo tournament can't set team settings");

  it.todo('update tournament');
});
