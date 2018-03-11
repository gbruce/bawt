import 'reflect-metadata';

import { Container, inject, injectable } from 'inversify';

import { ISession } from './interface/ISession';
import AuthHandler from './lib/auth/AuthHandler';
import { ConfigFactory } from './lib/auth/Config';
import { Realm } from './lib/auth/packets/server/RealmList';
import GameHandler from './lib/game/Handler';
import { GetVersion } from './lib/utils/Version';
import * as data from './lightshope.json';

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

@injectable()
export class Client implements ISession {
  private configFile: any;
  private selectedRealm: Realm|undefined;
  private configFactory: ConfigFactory;
  private _account: string = '';
  private _key: number[] = [];
  private container = new Container();

  constructor(@inject(AuthHandler) private auth: AuthHandler,
              @inject(GameHandler) private game: GameHandler) {
    this.configFile = data as any;
    this.configFactory = new ConfigFactory();
  }

  get key() {
    return this._key;
  }

  get account() {
    return this._account;
  }

  get build() {
    return parseInt(this.configFile.build, 10);
  }

  public async Start() {
    const authConfig = this.configFactory.Create(this.configFile.username,
      this.configFile.password, GetVersion());
    this._account = authConfig.Account;
    const session = await this.auth.connect(this.configFile.auth, this.configFile.port, authConfig);
    if (this.auth.key) {
      this._key = this.auth.key;
    }
    const realms = await session.GetRealms();
    const selectedRealm = realms.find((realmItem): boolean => {
      return realmItem.Name === this.configFile.realm;
    });

    if (selectedRealm) {
      await this.game.connectToRealm(this, selectedRealm);
    }

    const characters = await this.game.getChars();
    const selectedChar = characters.find((character) => {
      return character.Name === this.configFile.character;
    });

    if (selectedChar) {
      await this.game.join(selectedChar);
    }
  }

  public async Stop() {
    await this.game.disconnect();
  }
}
