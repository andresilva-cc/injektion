/* eslint-disable class-methods-use-this */

import UserRepository from './Contracts/UserRepository';

class MockUserRepository implements UserRepository {
  public all() {
    return [
      {
        id: 0,
        name: 'Jon Snow',
      },
      {
        id: 1,
        name: 'Daenerys Targaryen',
      },
    ];
  }
}

export default MockUserRepository;
