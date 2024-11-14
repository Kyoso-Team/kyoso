import Redis from 'ioredis';
import { env } from '$src/utils/env';

export const redis = new Redis(env.REDIS_URL);
