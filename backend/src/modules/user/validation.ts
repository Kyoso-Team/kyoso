import * as v from 'valibot';

export abstract class UserValidation {
  public static CreateUser = v.object({
    admin: v.boolean(),
    approvedHost: v.boolean()
  });

  public static UpdateUser = this.CreateUser;
}

export type UserValidationT = typeof UserValidation;
