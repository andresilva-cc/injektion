import UserRepository from './Contracts/UserRepository';
import SingletonTest from './SingletonTest';

class UserService {
  constructor(
    private userRepository: UserRepository,
    private singletonTest: SingletonTest,
  ) {}

  public all() {
    return this.userRepository.all();
  }
}

export default UserService;
