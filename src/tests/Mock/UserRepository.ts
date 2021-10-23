/* eslint-disable class-methods-use-this */

class UserRepository {
  public all() {
    return [
      {
        id: 0,
        name: 'Jon Snow',
      },
      {
        id: 1,
        name: 'Daeneris Targaryen',
      },
    ];
  }
}

export default UserRepository;
