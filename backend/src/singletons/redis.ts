import Redis from 'ioredis';
import { env } from '$services/env';

export const redis = new Redis(env.REDIS_URL);
