class SingletonTest {
  public createdAt: Number;

  constructor() {
    this.createdAt = new Date().getTime();
  }
}

export default SingletonTest;
