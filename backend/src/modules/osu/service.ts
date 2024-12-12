import { Client } from 'osu-web.js';
import { unknownError } from '$src/utils/error';
import { createServiceFnFromRepositoryQuery } from '$src/utils/factories';
import { osuRepository } from './repository';

async function getOsuSelf(accessToken: string) {
  const osu = new Client(accessToken);
  const user = await osu.users.getSelf().catch(unknownError('Failed to get osu! user data'));
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

const temporarilyStoreTokens = createServiceFnFromRepositoryQuery(
  osuRepository.temporarilyStoreTokens,
  'Failed to temporarily store osu! tokens'
);

async function getTemporarilyStoredTokens(
  ...args: Parameters<(typeof osuRepository)['getTemporarilyStoredTokens']>
) {
  const result = await osuRepository
    .getTemporarilyStoredTokens(...args)
    .catch(unknownError('Failed to get temporarily stored osu! tokens'));
  if (!result) return null;
  const data = JSON.parse(result as string) as {
    accessToken: string;
    refreshToken: string;
    tokenIssuedAt: number;
  };
  return data;
}

const deleteTemporarilyStoredTokens = createServiceFnFromRepositoryQuery(
  osuRepository.deleteTemporarilyStoredTokens,
  'Failed to delete temporarily stored osu! tokens'
);

export const osuService = {
  getOsuSelf,
  getOsuUserIdFromAccessToken,
  temporarilyStoreTokens,
  getTemporarilyStoredTokens,
  deleteTemporarilyStoredTokens
};
