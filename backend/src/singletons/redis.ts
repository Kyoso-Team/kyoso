import Redis from 'ioredis';
import { env } from '$src/utils/env';

export const redis = new Redis(env.NODE_ENV === 'test' ? env.TEST_REDIS_URL : env.REDIS_URL);
