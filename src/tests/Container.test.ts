import container from './Mock/container';
import UserController from './Mock/UserController';

describe('Container', () => {
  const userController = <UserController>container.get('UserController');

  test('call', () => {
    const result = userController.all();

    expect(result.status).toBe(200);
    expect(result.body.users.length).toBe(2);
    expect(result.body.users[0].name).toBe('Jon Snow');
  });
});
