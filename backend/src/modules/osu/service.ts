import { unknownError } from '$src/utils/error';
import { Client } from 'osu-web.js';

async function getOsuSelf(accessToken: string) {
  const osu = new Client(accessToken);
  const user = await osu.users.getSelf({
    urlParams: {
      mode: 'osu'
    }
  }).catch(unknownError('Failed to get osu! user data'));
  return user;
}

function getOsuUserIdFromAccessToken(accessToken: string) {
  const payloadString = accessToken.substring(
    accessToken.indexOf('.') + 1,
    accessToken.lastIndexOf('.')
  );
  const payloadBuffer = Buffer.from(payloadString, 'base64').toString('ascii');
  const payload: { sub: string } = JSON.parse(payloadBuffer);
  const osuUserId = Number(payload.sub);
  return osuUserId;
}

export const osuService = { getOsuSelf, getOsuUserIdFromAccessToken };