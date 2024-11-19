import * as v from 'valibot';
import * as s from '$src/utils/validation';

const CreateUser = v.object({
  osuUserId: s.integerId()
});

export type UserValidationOutput = {
  CreateUser: v.InferOutput<typeof CreateUser>;
}

export const UserValidation = {
  CreateUser
};