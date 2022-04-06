import Container from '../../../Container';
import SingletonTest from '../SingletonTest';
import MockUserRepository from '../MockUserRepository';

export default () => {
  Container.singleton(SingletonTest);
  Container.bind('UserRepository', MockUserRepository);
};
