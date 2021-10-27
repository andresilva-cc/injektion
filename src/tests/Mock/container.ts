import Container from '../../Container';
import MockUserRepository from './MockUserRepository';

const container = new Container();

container.bind('UserRepository', MockUserRepository);

export default container;
