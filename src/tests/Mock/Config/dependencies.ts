import Container from '../../../Container';
import SingletonTest from '../SingletonTest';
import MockUserRepository from '../MockUserRepository';

export default () => {
  const container = Container.getInstance();

  container.singleton(SingletonTest);
  container.bind('UserRepository', MockUserRepository);
};
