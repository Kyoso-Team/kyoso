import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as v from 'valibot';
import { devCheckMiddleware } from '$src/middlewares/dev.ts';
import { sessionMiddleware } from '$src/middlewares/session.ts';
import { DevService, devService } from '$src/modules/dev/service.ts';
import { integerId } from '$src/utils/validation.ts';
import { servicesMiddleware } from '$src/middlewares/services';
import { TestService } from '$src/modules/test/test.service';
import { elysia, t } from './base';
import { UserService } from '$src/modules/user/user.service';
import { status } from 'elysia';
import { AuthenticationService } from '$src/modules/authentication/authentication.service';

export const devRouter = elysia('/dev')
  .derive(({ requestId }) => {
    const authenticationService = new AuthenticationService('request', requestId);
    const testService = new TestService('request', requestId);
    const userService = new UserService('request', requestId);
    return { authenticationService, testService, userService };
  })
  .onBeforeHandle(() => {
    if (process.env.NODE_ENV !== 'development') {
      return status(403, 'This endpoint is only available in development environment');
    }
  })
  .get('/test', async ({ testService }) => {
    await testService.deleteTestTable();
    await testService.createTestTable();

    await testService.insertUser('sample');
    await testService.updateUser(1, 'Mario564');
    const userCount = testService.countUsers(1);
    await testService.deleteUser(1);
    await testService.testTransaction();

    await testService.deleteTestTable();

    await testService.setTestValue('test value', 1000);
    const value = await testService.getTestValue();
    await testService.setTestValue('test value 2');
    await testService.deleteTestValue();

    await testService.setTestDocs([
      { id: 1, value: '5 Digit World Cup 2023' },
      { id: 2, value: '5 Digit World Cup 2024' },
      { id: 3, value: '5 Digit World Cup 2025' },
      { id: 4, value: 'osu! World Cup 2025' }
    ]);
    await testService.deleteTestDoc(2);
    const searchResults = await testService.searchTestDocs('5 Digit');

    return {
      message: 'Test completed successfully',
      userCount,
      value,
      searchResults
    };
  })
  .put('/impersonate', async ({ headers, body, authenticationService, userService }) => {
    if (!headers['User-Agent']) {
      return status(400, '"User-Agent" header is undefined');
    }

    const user = await userService.getUser(body.userId);

    if (!user) {
      return status(404, 'The user you want to impersonate doesn\'t exist');
    }

    if (user.banned) {
      return status(403, 'The user you want to impersonate is banned');
    }

    await authenticationService.createSession(userId);
    return 'Successfully impersonated user';
  }, {
    body: t.Object({
      userId: t.IntegerId()
    })
  });


//   .put(
//     'impersonate',
//     vValidator(
//       'json',
//       v.object({
//         userId: integerId()
//       })
//     ),
//     async (c) => {
//       if (!c.req.header('User-Agent')) {
//         throw new HTTPException(400, {
//           message: '"User-Agent" header is undefined'
//         });
//       }

//       const body = c.req.valid('json');

//       return devService.impersonate(c, body.userId);
//     }
//   )
//   .patch(
//     'change-permissions',
//     vValidator(
//       'json',
//       v.object({
//         admin: v.boolean(),
//         approvedHost: v.boolean()
//       })
//     ),
//     sessionMiddleware(),
//     async (c) => {
//       const body = c.req.valid('json');

//       const { id } = c.get('user');

//       await devService.changePermissions(body, id);

//       return c.text('Successfully updated user permissions');
//     }
//   );
