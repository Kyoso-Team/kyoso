import { ApiKeyService } from '$src/modules/api-key/api-key.service';
import { createRouter } from './_base/router';
import { initServices, t } from './_base/common';

export const apiKeyRouter = createRouter({
  prefix: '/api-keys'  
})
  .use(initServices({
    apiKeyService: ApiKeyService
  }))
  .guard({
    session: true
  })
  .get('/', async ({ session, apiKeyService }) => {
    return await apiKeyService.getUserApiKeys(session.user.id);
  })
  .post('/', async ({ session, apiKeyService }) => {
    return await apiKeyService.createApiKey(session.user.id);
  })
  .delete('/:api_key_id', async ({ params, session, apiKeyService }) => {
    await apiKeyService.deleteApiKey(params.api_key_id, session.user.id);
  }, {
    params: t.Object({
      api_key_id: t.IntegerIdString()
    })
  });

