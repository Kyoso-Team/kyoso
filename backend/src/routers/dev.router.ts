import { status } from 'elysia';
import { AuthenticationService } from '$src/modules/authentication/authentication.service';
import { TestService } from '$src/modules/test/test.service';
import { UserService } from '$src/modules/user/user.service';
import { initServices, t } from './_base/common';
import { createRouter } from './_base/router';

export const devRouter = createRouter({
  prefix: '/dev'
})
  .use(initServices({
    authenticationService: AuthenticationService,
    testService: TestService,
    userService: UserService
  }))
  .guard({
    devOnly: true
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
  .put(
    '/impersonate',
    async ({ body, headers, authenticationService, userService }) => {
      const user = await userService.getUser(body.userId);

      if (!user) {
        return status(404, "The user you want to impersonate doesn't exist");
      }

      if (user.banned) {
        return status(403, 'The user you want to impersonate is banned');
      }

      await authenticationService.createSession(
        body.userId,
        '127.0.0.1',
        {
          city: 'Sample',
          country: 'Sample',
          region: 'Sample'
        },
        headers['user-agent'] ?? null
      );
    },
    {
      body: t.Object({
        userId: t.IntegerId()
      })
    }
  )
  .patch(
    '/change-permissions',
    async ({ body, session, authenticationService }) => {
      await authenticationService.updateUser(session.user.id, body);
    },
    {
      body: t.Partial(
        t.Object({
          admin: t.Boolean(),
          approvedHost: t.Boolean()
        })
      ),
      session: true
    }
  );
