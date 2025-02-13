import { HTTPException } from 'hono/http-exception';
import { authenticationService } from '$src/modules/authentication/service.ts';
import { userRepository } from '$src/modules/user/repository.ts';
import { db } from '$src/singletons';
import type { Context } from 'hono';

class DevService {
  public async impersonate(c: Context, userId: number) {
    const user = await userRepository.getUser(db, userId, {
      id: true,
      banned: true
    });

    if (!user) {
      throw new HTTPException(404, {
        message: "The user you want to impersonate doesn't exist"
      });
    }

    if (user.banned) {
      throw new HTTPException(403, {
        message: 'The user you want to impersonate is banned'
      });
    }

    await authenticationService.createSession(c, db, userId);

    return c.text('Successfully impersonated user');
  }
}

export const devService = new DevService();
