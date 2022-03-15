import container from './Mock/container';
import UserController from './Mock/UserController';

describe('Container', () => {
  let userController: UserController;

  beforeAll(async () => {
    await container.autoload('./src/tests/Mock');
    userController = <UserController>container.get('UserController');
  });

  it('should contain the registered dependencies', () => {
    expect(container.has('UserController')).toBe(true);
    expect(container.has('UserService')).toBe(true);
    expect(container.has('UserRepository')).toBe(true);
  });

  it('should normalize the dependency name', () => {
    expect(container.has('UserController')).toBe(true);
    expect(container.has('userController')).toBe(true);
    expect(container.has('usercontroller')).toBe(true);
    expect(container.has('user_controller')).toBe(true);
  });

  test('class method should return the correct data using nested dependencies', () => {
    const result = userController.all();

    expect(result.status).toBe(200);
    expect(result.body.users.length).toBe(2);
    expect(result.body.users[0].name).toBe('Jon Snow');
  });

  it('should throw when trying to get an inexistent dependency', () => {
    expect(() => container.get('OrderRepository')).toThrow();
  });
});
