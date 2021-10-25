import Container from '../../Container';
import UserController from './UserController';
import UserService from './UserService';
import UserRepository from './UserRepository';

const container = new Container();

container.register(UserController);
container.register(UserService);
container.register(UserRepository);

export default container;
