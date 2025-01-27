import { ServiceFactory } from '$src/utils/factories';
import { userRepository } from './repository';
import { UserValidation } from './validation';

class UserService {
  public createUser = new ServiceFactory(
    userRepository.createUser,
    'Failed to create user'
  ).createWithValidation(UserValidation.CreateUser, 'user');
}

export const userService = new UserService();
