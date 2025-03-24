import { db } from '$src/singletons';
import { Service } from '$src/utils/service';
import { apiKeyRepository } from './repository';

class ApiKeyService extends Service {
  private BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  private RANDOMNESS_LENGTH = 30;
  private CHECKSUM_LENGTH = 6;

  public async checkApiKey(apiKey: string) {
    return await apiKeyRepository.checkApiKeyExists(db, apiKey);
  }

  public async getUserApiKeys(userId: number) {
    return await apiKeyRepository.getUserApiKeys(db, userId).then((res) =>
      res.map((r) => {
        return {
          ...r,
          key: `${r.key.substring(0, 12)}...`
        };
      })
    );
  }

  public async createApiKey(userId: number) {
    const key = this.generateKey();
    return await apiKeyRepository.createApiKey(db, key, userId);
  }

  public async deleteApiKey(apiKeyId: number, userId: number) {
    return await apiKeyRepository.deleteApiKey(db, apiKeyId, userId);
  }

  private generateRandomString(length: number) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  private encodeBase62(num: number, length: number) {
    let encoded = '';
    while (num > 0) {
      encoded = this.BASE62[num % 62] + encoded;
      num = Math.floor(num / 62);
    }
    return encoded.padStart(length, '0');
  }

  private generateKey() {
    const randomness = this.generateRandomString(this.RANDOMNESS_LENGTH);

    const checksumValue = Bun.hash.crc32(Buffer.from(randomness));

    const checksum = this.encodeBase62(checksumValue, this.CHECKSUM_LENGTH);

    return `${randomness}${checksum}`;
  }
}

export const apiKeyService = new ApiKeyService();
