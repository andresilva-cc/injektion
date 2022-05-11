import Container from '../Container';
import bindDependencies from './Mock/Config/dependencies';
import SingletonTest from './Mock/SingletonTest';
import User from './Mock/User';
import UserController from './Mock/UserController';
import UserService from './Mock/UserService';

describe('Container', () => {
  let userController: UserController;

  beforeAll(async () => {
    bindDependencies();
    await Container.autoload('./src/tests/Mock');

    userController = <UserController>Container.get('UserController');
  });

  it('should contain the binded dependencies', () => {
    expect(Container.has('UserController')).toBe(true);
    expect(Container.has('UserService')).toBe(true);
    expect(Container.has('UserRepository')).toBe(true);
  });

  it('should normalize the dependency name', () => {
    expect(Container.has('UserController')).toBe(true);
    expect(Container.has('userController')).toBe(true);
    expect(Container.has('usercontroller')).toBe(true);
    expect(Container.has('user_controller')).toBe(true);
  });

  test('class method should return the correct data using nested dependencies', () => {
    const result = userController.all();

    expect(result.status).toBe(200);
    expect(result.body.users.length).toBe(2);
    expect(result.body.users[0].name).toBe('Jon Snow');
  });

  test('singletons should return the same instance', (done) => {
    const singleton1 = <SingletonTest>Container.get('SingletonTest');
    setTimeout(() => {
      try {
        const singleton2 = <SingletonTest>Container.get('SingletonTest');

        expect(singleton1.createdAt).toStrictEqual(singleton2.createdAt);
        done();
      } catch (error) {
        done(error);
      }
    }, 5);
  });

  it('should return the same instance when binding a given instance', () => {
    const instance = new User('Slash');

    Container.instance(User, instance);
    const userFromContainer = <User>Container.get('User');

    expect(userFromContainer.name).toBe('Slash');
  });

  test('bind with manual instructions', () => {
    Container.instructions('ManualUserService', (container) => (
      new UserService(
        {
          all: () => (
            [
              {
                id: 0,
                name: 'Steve Jobs',
              },
            ]
          ),
        },
        container.get('SingletonTest'),
      )
    ));

    const userService = <UserService>Container.get('ManualUserService');

    expect(userService.all()[0].name).toBe('Steve Jobs');
    expect(userService.singletonTest.createdAt).toBeDefined();
  });

  it('should throw when trying to get an inexistent dependency', () => {
    expect(() => Container.get('OrderRepository')).toThrow();
  });

  it('should throw when trying to resolve an inexistent dependency', () => {
    expect(() => Container.get('Route')).toThrow();
  });
});
