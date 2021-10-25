import Container from '../../Container';
import UserController from './UserController';
import UserService from './UserService';
import MockUserRepository from './MockUserRepository';

const container = new Container();

container.register(UserController);
container.register(UserService);
container.bind('UserRepository', MockUserRepository);

export default container;
