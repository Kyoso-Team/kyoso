import { bearerAuth } from 'hono/bearer-auth';
import { apiKeyService } from '$src/modules/api-key/service';

export const apiKeyMiddleware = bearerAuth({
  verifyToken: async (token, _) => {
    return apiKeyService.checkApiKey(token);
  }
});
