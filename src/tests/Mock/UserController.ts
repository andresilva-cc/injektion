import UserService from './UserService';

class UserController {
  constructor(
    private userService: UserService,
  ) {}

  public all() {
    const users = this.userService.all();

    return {
      status: 200,
      body: {
        users,
      },
    };
  }
}

export default UserController;
