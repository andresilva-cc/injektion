import Container from '../../Container';
import MockUserRepository from './MockUserRepository';

const container = Container.getInstance();

container.bind('UserRepository', MockUserRepository);

export default container;
