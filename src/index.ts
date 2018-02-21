import * as data from './lightshope.json';
import { Session } from './interface/Session';
import { default as AuthHandler } from './lib/auth/AuthHandler';
import { default as GameHandler } from './lib/game/Handler';
import { Realm } from './lib/auth/packets/server/RealmList';
import { SetVersion, Version, GetVersion } from './lib/utils/Version';
import { SocketFactory } from './lib/net/SocketFactory';
import { ConfigFactory } from './lib/auth/Config';
import { RealmList } from './lib/auth/packets/server/RealmList';
import Socket from 'lib/net/Socket';

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
  public majorVersion: number = 0;
  public minorVersion: number = 0;
  public patchVersion: number = 0;

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
  private configFile: any;
  private socketFactory: SocketFactory;
  private auth: AuthHandler;
  private game: GameHandler;
  private selectedRealm: Realm|undefined;
  private configFactory: ConfigFactory;
  private _account: string = '';
  private _key: number[] = [];

  constructor() {
    this.configFile = data as any;
    SetVersion(this.configFile.version);
    this.config.version = this.configFile.version;
    this.config.build =  parseInt(this.configFile.build, 10);
    this.socketFactory = new SocketFactory();
    this.configFactory = new ConfigFactory();
    this.auth = new AuthHandler(this.socketFactory);
    this.game = new GameHandler(this, this.socketFactory);
  }

  get key() {
    return this._key;
  }

  get account() {
    return this._account;
  }

  public async Start() {
    const authConfig = this.configFactory.Create(this.configFile.username,
      this.configFile.password, GetVersion());
    this._account = authConfig.Account;
    const session = await this.auth.connect2(this.configFile.auth, this.configFile.port, authConfig);
    if (this.auth.key) {
      this._key = this.auth.key;
    }
    const realms = await session.GetRealms();
    const selectedRealm = realms.find((realmItem): boolean => {
      return realmItem.Name === this.configFile.realm;
    });

    if (selectedRealm) {
      await this.game.connectToRealm(selectedRealm);
    }

    const characters = await this.game.getChars();
    const selectedChar = characters.find((character) => {
      return character.Name === this.configFile.character;
    });

    if (selectedChar) {
      await this.game.join(selectedChar);
    }

//    this.auth.connect(config.auth, config.port);

/*
    this.auth.on('connect', () => {
      const authConfig2 = this.configFactory.Create(config.username,
        config.password, GetVersion());
      this.auth.authenticate(authConfig);
    });

    this.auth.on('authenticate', () => {
      this.auth.requestRealmList();
    });

    this.auth.on('realmList', (realmList: RealmList) => {
      const selectedRealm = realmList.Realms.find((realmItem): boolean => {
        return realmItem.Name === config.realm;
      });

      if (selectedRealm) {
        this.game.connectToRealm(selectedRealm);
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
    */
  }
}

const client = new Client();
client.Start();
