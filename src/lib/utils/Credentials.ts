
import * as data from '../../lightshope.json';

export class Credentials {
  public Account: string = '';
  public Password: string = '';

  public Validated() {
    return {
      account: this.Account.toUpperCase(),
      password: this.Password.toUpperCase(),
    };
  }
}
