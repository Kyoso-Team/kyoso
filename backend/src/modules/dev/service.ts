import { HTTPException } from 'hono/http-exception';
import { authenticationService } from '$src/modules/authentication/authentication.service';
import { userRepository } from '$src/modules/user/user.repository';
import { userService } from '$src/modules/user/user.service';
import { User } from '$src/schema';
import { db } from '$src/singletons';
import type { InferSelectModel } from 'drizzle-orm';
import type { Context } from 'hono';
import { Service } from '$src/utils/service';

export class DevService extends Service {
  public async impersonate(userId: number) {
    await authenticationService.createSession(userId);
  }

  public async changePermissions(
    permissions: Record<
      keyof Pick<InferSelectModel<typeof User>, 'admin' | 'approvedHost'>,
      boolean
    >,
    userId: number
  ) {
    await userService.updateUser(db, permissions, userId);
  }
}
