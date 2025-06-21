import { and, eq } from 'drizzle-orm';
import { UserApiKey } from '$src/schema';
import { pick } from '$src/utils/query';
import type { DatabaseClient } from '$src/types';
import { DbRepository } from '$src/utils/repository';

class ApiKeyDbRepository extends DbRepository {
  public createApiKey(db: DatabaseClient, apiKey: typeof UserApiKey.$inferInsert) {
    const query = db
      .insert(UserApiKey)
      .values(apiKey)
      .returning(pick(UserApiKey, {
        id: true
      }));

    return this.wrap({
      query,
      name: 'Create API key',
      map: this.map.firstRow
    });
  }

  public resetApiKey(db: DatabaseClient, apiKeyId: number, newKey: string, userId: number) {
    const query = db
      .update(UserApiKey)
      .set({
        key: newKey
      })
      .where(and(eq(UserApiKey.id, apiKeyId), eq(UserApiKey.userId, userId)));

    return this.wrap({
      query,
      name: 'Reset API key'
    });
  }

  public deleteApiKey(db: DatabaseClient, apiKeyId: number, userId: number) {
    const query = db
      .delete(UserApiKey)
      .where(and(eq(UserApiKey.id, apiKeyId), eq(UserApiKey.userId, userId)));

    return this.wrap({
      query,
      name: 'Delete API key'
    });
  }

  public getUserApiKeys(db: DatabaseClient, userId: number) {
    const query = db
      .select(
        pick(UserApiKey, {
          id: true,
          createdAt: true
        })
      )
      .from(UserApiKey)
      .where(eq(UserApiKey.userId, userId));

    return this.wrap({
      query,
      name: 'Get user API keys'
    });
  }

  public doesApiKeyExist(db: DatabaseClient, apiKey: string) {
    const query = this.utils.exists(db, UserApiKey, and(eq(UserApiKey.key, apiKey)));

    return this.wrap({
      query,
      name: 'Check if API key exists',
      map: this.map.rowExists
    });
  }
}

class ApiKeyRepository {
  public db = new ApiKeyDbRepository();
}

export const apiKeyRepository = new ApiKeyRepository();
