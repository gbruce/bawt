import * as data from './client.json';
import { Session } from './interface/Session';
import { default as AuthHandler } from './lib/auth/AuthHandler';
import Character from './lib/characters/Character';
import { default as CharacterHandler } from './lib/characters/Handler';
import { default as GameHandler } from './lib/game/Handler';
import { default as RealmsHandler } from './lib/realms/Handler';
import { default as Realm } from './lib/realms/Realm';
import realm from './lib/realms/Realm';

class Raw {
  public config: Config;
  constructor(config: Config) {
    this.config = config;
  }

  public raw(value: string) {
    return (value.split('').reverse().join(''));
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
  public game: string = 'WoW';
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
      this.patchVersion,
    ] = version.split('.').map((bit) => {
      return parseInt(bit, 10);
    });
  }

}

class Client implements Session {
  public config: Config = new Config();
  private auth: AuthHandler;
  private realm: RealmsHandler;
  private character: CharacterHandler;
  private game: GameHandler;
  private selectedRealm: Realm|undefined;
  private selectedChar: Character|undefined;

  get key() {
    return this.auth.key;
  }

  get account() {
    return this.auth.account;
  }

  public Start() {
    const config = data as any;
    this.auth = new AuthHandler(this);
    this.game = new GameHandler(this);
    this.realm = new RealmsHandler(this);
    this.character = new CharacterHandler(this);

    this.auth.connect(config.auth, config.port);

    this.auth.on('connect', () => {
      this.auth.authenticate(config.username, config.password);
    });

    this.auth.on('authenticate', () => {
      this.realm.refresh();
    });

    this.realm.on('refresh', () => {
      this.selectedRealm = this.realm.list.find((realmItem): boolean => {
        return realmItem.name === config.realm;
      });

      if (this.selectedRealm) {
        this.game.connect(this.selectedRealm.host, this.selectedRealm.port);
      }
    });

    this.game.on('authenticate', () => {
      this.character.refresh();
    });

    this.character.on('refresh', () => {
      this.selectedChar = this.character.list.find((character) => {
        return character.name === config.character;
      });

      if (this.selectedRealm) {
        if (this.selectedChar) {
          this.game.join(this.selectedChar);
        }
      }
    });
  }
}

const client = new Client();
client.Start();
