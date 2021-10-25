import UserRepository from './Contracts/UserRepository';

class UserService {
  constructor(
    private userRepository: UserRepository,
  ) {}

  public all() {
    return this.userRepository.all();
  }
}

export default UserService;
