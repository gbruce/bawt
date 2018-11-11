import { delay }  from './Functions';

export class Lock {
  private locked: boolean = false;

  public async lock() {
    while (this.locked) {
      await delay(10);
    }

    this.locked = true;
  }

  public unlock() {
    this.locked = false;
  }
}
