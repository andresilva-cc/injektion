import Container from '../../Container';
import MockUserRepository from './MockUserRepository';

const container = new Container({
  autoloadBaseDir: './src/tests/Mock',
});

container.bind('UserRepository', MockUserRepository);

export default container;
