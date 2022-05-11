import UserRepository from './Contracts/UserRepository';
import SingletonTest from './SingletonTest';

class UserService {
  constructor(
    private userRepository: UserRepository,
    public singletonTest: SingletonTest,
  ) {}

  public all() {
    return this.userRepository.all();
  }
}

export default UserService;
