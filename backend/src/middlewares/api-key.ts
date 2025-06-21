import { bearerAuth } from 'hono/bearer-auth';
import { ApiKeyService } from '$src/modules/api-key/api-key.service';

export const apiKeyMiddleware = bearerAuth({
  verifyToken: async (token, c) => {
    const apiKeyService = new ApiKeyService('request', c.get('requestId'));
    return apiKeyService.doesApiKeyExist(token);
  }
});
