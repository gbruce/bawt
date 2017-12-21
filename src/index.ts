import { default as AuthHandler } from './lib/auth/AuthHandler';
import { default as RealmsHandler } from './lib/realms/Handler';
import { Session } from './interface/Session';

class Raw {
  public config: Config;
  constructor(config: Config) {
    this.config = config;
  }

  raw(value: string) {
    return ('\u0000\u0000\u0000\u0000' + value.split('').reverse().join('')).slice(-4);
  }

  get locale() {
    return this.raw(this.config.locale);
  }

  get os() {
    return this.raw(this.config.os);
  }

  get platform() {
    return this.raw(this.config.platform);
  }

}

class Config {
  public game: string = 'Wow ';
  public build: number = 12340;
  public timezone: number = 0;
  public locale: string = 'enUS';
  public os: string = 'Win';
  public platform: string = 'x86';
  public raw: Raw = new Raw(this);
  public majorVersion: number;
  public minorVersion: number;
  public patchVersion: number;
  
  constructor() {
    this.version = '3.3.5';
  }

  set version(version: string) {
    [
      this.majorVersion,
      this.minorVersion,
      this.patchVersion
    ] = version.split('.').map(function(bit) {
      return parseInt(bit, 10);
    });
  }

}

class Client implements Session {
  private auth: AuthHandler;
  private realm: RealmsHandler;

  Start() {
    this.auth = new AuthHandler(this);
    this.realm = new RealmsHandler(this);

    this.auth.connect("logon.warmane.com",3724);

    this.auth.on('connect', () => {
      console.log('connected');
      this.auth.authenticate('test', 'test');
    });
    
    this.auth.on('authenticate', () => {
      console.log('authenticated');

      this.realm.refresh();
    });
  }

  public config: Config = new Config();
}

const client = new Client();
client.Start();
