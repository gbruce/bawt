import { IFactory } from '../../interface/IFactory';
import { IConfig } from '../../interface/iConfig';
import { Version } from '../utils/Version';

export class ConfigFactory implements IFactory<IConfig> {
  private reverse(value: string) {
    return value.split('').reverse().join('');
  }
  public Create(account: string, password: string, version: Version): IConfig {
    switch (version) {
      case Version.WoW_1_12_1:
        return {
          Account: account.toUpperCase(),
          Password: password.toUpperCase(),
          Game: 'WoW',
          Major: 1,
          Minor: 12,
          Patch: 1,
          Build: 5875,
          Platform: this.reverse('x86'),
          Os: this.reverse('OSX'),
          Locale: this.reverse('enUS'),
          Timezone: 0,
          IPAddress: 0,
        };

      case Version.WoW_3_3_5:
      default:
        return {
          Account: account.toUpperCase(),
          Password: password.toUpperCase(),
          Game: 'WoW',
          Major: 3,
          Minor: 3,
          Patch: 5,
          Build: 12340,
          Platform: this.reverse('x86'),
          Os: this.reverse('OSX'),
          Locale: this.reverse('enUS'),
          Timezone: 0,
          IPAddress: 0,
        };
    }
  }
}
