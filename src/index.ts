import * as data from './lightshope.json';
import { Session } from './interface/Session';
import { default as AuthHandler } from './lib/auth/AuthHandler';
import Character from './lib/characters/Character';
import { default as CharacterHandler } from './lib/characters/Handler';
import { default as GameHandler } from './lib/game/Handler';
import { default as RealmsHandler } from './lib/realms/Handler';
import { default as Realm } from './lib/realms/Realm';
import realm from './lib/realms/Realm';
import { SetVersion, Version } from './lib/utils/Version';

/*
wow client packets prior to login
S->C: 73.202.11.217 [SMSG_AUTH_CHALLENGE 0x01EC (492)]
C->S: 73.202.11.217 [CMSG_AUTH_SESSION 0x01ED (493)]
Allowed Level: 0 Player Level 0
WorldSocket::HandleAuthSession: Client 'TRINITY' authenticated successfully from 73.202.11.217.
S->C: [Player: Account: 1] [SMSG_AUTH_RESPONSE 0x01EE (494)]
S->C: [Player: Account: 1] [SMSG_ADDON_INFO 0x02EF (751)]
S->C: [Player: Account: 1] [SMSG_CLIENTCACHE_VERSION 0x04AB (1195)]
S->C: [Player: Account: 1] [SMSG_TUTORIAL_FLAGS 0x00FD (253)]
C->S: [Player: Account: 1] [CMSG_READY_FOR_ACCOUNT_DATA_TIMES 0x04FF (1279)]
C->S: [Player: Account: 1] [CMSG_CHAR_ENUM 0x0037 (55)]
C->S: [Player: Account: 1] [CMSG_REALM_SPLIT 0x038C (908)]
WORLD: CMSG_READY_FOR_ACCOUNT_DATA_TIMES
S->C: [Player: Account: 1] [SMSG_ACCOUNT_DATA_TIMES 0x0209 (521)]
CMSG_REALM_SPLIT
S->C: [Player: Account: 1] [SMSG_REALM_SPLIT 0x038B (907)]
Loading GUID Full: 0x0000000000000001 Type: Player Low: 1 from account 1.
S->C: [Player: Account: 1] [SMSG_CHAR_ENUM 0x003B (59)]
C->S: 73.202.11.217 [CMSG_PING 0x01DC (476)]
S->C: 73.202.11.217 [SMSG_PONG 0x01DD (477)]
C->S: 73.202.11.217 [CMSG_PING 0x01DC (476)]
S->C: 73.202.11.217 [SMSG_PONG 0x01DD (477)]
*/

/*
bot packets prior to login
S->C: 73.202.11.217 [SMSG_AUTH_CHALLENGE 0x01EC (492)]
C->S: 73.202.11.217 [CMSG_AUTH_SESSION 0x01ED (493)]
Allowed Level: 0 Player Level 0
WorldSocket::HandleAuthSession: Client 'TRINITY' authenticated successfully from 73.202.11.217.
S->C: [Player: Account: 1] [SMSG_AUTH_RESPONSE 0x01EE (494)]
S->C: [Player: Account: 1] [SMSG_ADDON_INFO 0x02EF (751)]
S->C: [Player: Account: 1] [SMSG_CLIENTCACHE_VERSION 0x04AB (1195)]
S->C: [Player: Account: 1] [SMSG_TUTORIAL_FLAGS 0x00FD (253)]
C->S: [Player: Account: 1] [CMSG_CHAR_ENUM 0x0037 (55)]
Loading GUID Full: 0x0000000000000001 Type: Player Low: 1 from account 1.
S->C: [Player: Account: 1] [SMSG_CHAR_ENUM 0x003B (59)]
C->S: [Player: Account: 1] [CMSG_PLAYER_LOGIN 0x003D (61)]

*/

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
  public os: string = 'OSX';
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
    SetVersion(config.version);
    this.config.version = config.version;
    this.config.build =  parseInt(config.build, 10);
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
        this.game.connectToRealm(this.selectedRealm);
      }
    });

    this.game.on('authenticate', () => {
      this.character.refresh();
      this.game.NotifyReadyForAccountDataTimes();
      this.game.RequestRealmSplitState();
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
