import Container from '../Container';
import bindDependencies from './Mock/Config/dependencies';
import SingletonTest from './Mock/SingletonTest';
import UserController from './Mock/UserController';

describe('Container', () => {
  const container = Container.getInstance();
  let userController: UserController;

  beforeAll(async () => {
    await container.autoload('./src/tests/Mock');
    bindDependencies();

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

  test('singletons should return the same instance', (done) => {
    const singleton1 = <SingletonTest>container.get('SingletonTest');
    setTimeout(() => {
      try {
        const singleton2 = <SingletonTest>container.get('SingletonTest');

        expect(singleton1.createdAt).toStrictEqual(singleton2.createdAt);
        done();
      } catch (error) {
        done(error);
      }
    }, 5);
  });
});
