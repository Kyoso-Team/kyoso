import * as v from 'valibot';

const CreateUser = v.object({
  admin: v.boolean(),
  approvedHost: v.boolean()
});

const UpdateUser = CreateUser;

export const UserValidation = {
  CreateUser,
  UpdateUser
};
