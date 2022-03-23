import Container from '../../../Container';
import MockUserRepository from '../MockUserRepository';

export default () => {
  const container = Container.getInstance();

  container.bind('UserRepository', MockUserRepository);
};
