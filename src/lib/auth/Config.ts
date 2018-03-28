import { injectable } from 'inversify';
import { IConfig } from '../../interface/IConfig';
import { IFactory } from '../../interface/IFactory';
import { Version, SetVersion, GetVersion } from '../utils/Version';
import * as data from '../../lightshope.json';

@injectable()
export class Config implements IConfig {
  public AuthServer: string = '';
  public Port: number = 0;
  public Realm: string = '';
  public Character: string = '';
  public Account: string = '';
  public Password: string = '';
  public Game: string = 'WoW';
  public Major: number = 0;
  public Minor: number = 0;
  public Patch: number = 0;
  public Build: number = 0;
  public Platform: string = this.reverse('x86');
  public Os: string = this.reverse('OSX');
  public Locale: string = this.reverse('enUS');
  public Timezone: number = 0;
  public IPAddress: number = 0;

  constructor() {
    const file = data as any;
    this.Account = file.username.toUpperCase();
    this.Password = file.password.toUpperCase();
    this.AuthServer = file.auth;
    this.Realm = file.realm;
    this.Port = file.port;
    this.Character = file.character;

    SetVersion(file.version);

    switch (GetVersion()) {
      case Version.WoW_1_12_1:
        this.Major = 1;
        this.Minor = 12;
        this.Patch = 1;
        this.Build = 5875;
        break;
      case Version.WoW_3_3_5:
        this.Major = 3;
        this.Minor = 3;
        this.Patch = 5;
        this.Build = 12340;
        break;
      default:
        throw new Error('Unsupported version ' + GetVersion());
    }
  }

  private reverse(value: string) {
    return value.split('').reverse().join('');
  }
}

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
          AuthServer: '',
          Port: 0,
          Realm: '',
          Character: '',
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
          AuthServer: '',
          Port: 0,
          Realm: '',
          Character: '',
        };
    }
  }
}
