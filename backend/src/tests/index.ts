// import { testClient } from 'hono/testing';
// import app from '$src';
// import { env } from '$src/utils/env';

// if (env.NODE_ENV !== 'test') {
//   throw new Error('Only import this file in test environment');
// }

// export const api = testClient(app);

// export function loginAs(userId: number) {
//   return api.auth.login.test.$post({ json: { userId } });
// }

// export function logout() {
//   return api.auth.logout.test.$post();
// }
