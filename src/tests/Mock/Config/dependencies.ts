import Container from '../../../Container';
import SingletonTest from '../SingletonTest';
import MockUserRepository from '../MockUserRepository';

export default () => {
  Container.singleton(SingletonTest);
  Container.namedBind('UserRepository', MockUserRepository);
};
