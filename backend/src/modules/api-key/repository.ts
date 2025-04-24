import { and, eq } from 'drizzle-orm';
import { UserApiKey } from '$src/schema';
import { pick } from '$src/utils/query';
import { entityRepository } from '../entity/repository';
import type { DatabaseClient } from '$src/types';

class ApiKeyRepository {
  public async checkApiKeyExists(db: DatabaseClient, apiKey: string) {
    return entityRepository.exists(db, UserApiKey, and(eq(UserApiKey.key, apiKey)));
  }

  public async getUserApiKeys(db: DatabaseClient, userId: number) {
    return db
      .select(
        pick(UserApiKey, {
          id: true,
          key: true,
          createdAt: true
        })
      )
      .from(UserApiKey)
      .where(eq(UserApiKey.userId, userId));
  }

  public async createApiKey(db: DatabaseClient, key: string, userId: number) {
    return db
      .insert(UserApiKey)
      .values({
        key,
        userId
      })
      .returning({
        key: UserApiKey.key
      })
      .then((res) => res[0].key);
  }

  public async deleteApiKey(db: DatabaseClient, apiKeyId: number, userId: number) {
    return db
      .delete(UserApiKey)
      .where(and(eq(UserApiKey.id, apiKeyId), eq(UserApiKey.userId, userId)));
  }
}

export const apiKeyRepository = new ApiKeyRepository();
