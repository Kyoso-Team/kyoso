import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as v from 'valibot';
import { devCheckMiddleware } from '$src/middlewares/dev.ts';
import { sessionMiddleware } from '$src/middlewares/session.ts';
import { devService } from '$src/modules/dev/service.ts';
import { integerId } from '$src/utils/validation.ts';
import { servicesMiddleware } from '$src/middlewares/services';
import { TestService } from '$src/modules/test/test.service';
import { elysia } from './base';

export const devRouter = elysia('/dev')
  .derive(({ requestId }) => {
    const testService = new TestService('request', requestId);
    return { testService };
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

    return {
      message: 'Test completed successfully',
      userCount,
      value
    };
  });


// export const devRouter = new Hono()
//   .basePath('/dev')
//   .use(servicesMiddleware({
//     testService: TestService
//   }))
//   .use(devCheckMiddleware)
//   .get('/test', async (c) => {
//     await c.var.testService.deleteTestTable();
//     await c.var.testService.createTestTable();

//     await c.var.testService.insertUser('sample');
//     await c.var.testService.updateUser(1, 'Mario564');
//     const userCount = await c.var.testService.countUsers(1);
//     await c.var.testService.deleteUser(1);
//     await c.var.testService.testTransaction();

//     await c.var.testService.deleteTestTable();

//     await c.var.testService.setTestValue('test value', 1000);
//     const value = await c.var.testService.getTestValue();
//     await c.var.testService.setTestValue('test value 2');
//     await c.var.testService.deleteTestValue();

//     return c.json({
//       message: 'Test completed successfully',
//       userCount,
//       value
//     });
//   })
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
