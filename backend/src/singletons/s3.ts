import { S3 } from '@aws-sdk/client-s3';
import { env } from '$services/env';

export const s3 = new S3({
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY
  }
});
