import { bearer } from '@elysiajs/bearer';
import { common, type RouterConfig } from './common';
import { UserService } from '$src/modules/user/user.service';

export const createPublicApiRouter = <TPrefix extends string>(config?: RouterConfig<TPrefix>) =>
  common(config)
    .use(bearer())
    .resolve(async ({ requestId, bearer }) => {
      const userService = new UserService('request', requestId);

      const user = await userService.getUserByApiKey(bearer);
      if (!user) {
        throw new Error('User not found. API Key may be invalid');
      }

      return { user };
    });
