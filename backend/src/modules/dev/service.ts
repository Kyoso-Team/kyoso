import { HTTPException } from 'hono/http-exception';
import { authenticationService } from '$src/modules/authentication/service.ts';
import { userRepository } from '$src/modules/user/repository.ts';
import { db } from '$src/singletons';
import type { Context } from 'hono';

class DevService {
  public async impersonate(c: Context, userId: number) {
    const userExists = await userRepository.getUser(db, userId, {
      id: true
    });

    if (!userExists) {
      throw new HTTPException(404, {
        message: "The user you want to impersonate doesn't exist"
      });
    }

    await authenticationService.createSession(c, db, userId);

    return c.text('Successfully impersonated user');
  }
}

export const devService = new DevService();
