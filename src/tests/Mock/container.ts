import Container from '../../Container';
import UserController from './UserController';
import UserService from './UserService';
import UserRepository from './UserRepository';

const container = new Container();

container.register('UserController', UserController);
container.register('UserService', UserService);
container.register('UserRepository', UserRepository);

export default container;
