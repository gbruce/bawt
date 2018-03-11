import * as ByteBuffer from 'bytebuffer';
import { inject, injectable, named } from 'inversify';

import { ICrypt } from '../../interface/ICrypt';
import { IDeserializer } from '../../interface/IDeserializer';
import { IRealm } from '../../interface/IRealm';
import { ISerializer } from '../../interface/ISerializer';
import { ISession } from '../../interface/ISession';
import { ISocket } from '../../interface/ISocket';
import BigNum from '../crypto/BigNum';
import SHA1 from '../crypto/hash/SHA1';
import RC4Crypt from '../crypto/RC4Crypt';
import WowCrypt from '../crypto/WowCrypt';
import { NewLogger } from '../utils/Logger';
import { GetVersion, Version } from '../utils/Version';
import GameOpcode from './Opcode';
import { AuthProof } from './packets/client/AuthProof';
import { CMsgCharEnum } from './packets/client/CMsgCharEnum';
import { CMsgPlayerLogin } from './packets/client/CMsgPlayerLogin';
import { CMsgLogoutRequest } from './packets/client/CMsgLogoutRequest';
import { SMsgLogoutResponse } from './packets/server/SMsgLogoutResponse';
import { SAuthChallenge } from './packets/server/AuthChallenge';
import { SAuthResponse } from './packets/server/AuthResponse';
import { ServerPacket } from './packets/server/ServerPacket';
import { Character, SMsgCharEnum } from './packets/server/SMsgCharEnum';

const log = NewLogger('game/Handler');

const readIntoByteArray = (bytes: number, bb: ByteBuffer) => {
  const result = [];
  for (let i = 0; i < bytes; i++) {
    result.push(bb.readUint8());
  }
  return result;
};

@injectable()
export class GameHandler {
  private session: ISession|null = null;
  private useCrypt = false;
  private crypt: ICrypt|null = null;
  private realm: IRealm|null = null;
  private pingCount: number = 1;

  // Creates a new game handler
  constructor(@inject('ISocket') private socket: ISocket,
              @inject('ISerializer') @named('Game') private serializer: ISerializer,
              @inject('IDeserializer') @named('Game') private deserializer: IDeserializer) {
    this.serializer.OnPacketSerialized.sub((buffer) => this.socket.sendBuffer(buffer));

    this.socket.OnDataReceived.sub((arrayBuffer) => this.deserializer.Deserialize(arrayBuffer));

    /*
    this.on('packet:receive:SMSG_PONG', (packet: any) => {
      packet.readUint16(); // size
      packet.readUint16(); // opcode
      const pingCount = packet.readUint32(); // size
      log.info(`Pong ${pingCount}`);
    });
    */

    if (GetVersion() === Version.WoW_1_12_1) {
      this.crypt = new WowCrypt();
    }
    else {
      this.crypt = new RC4Crypt();
    }
  }

  private async waitForOpcode<T>(opcode: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      log.info(`waitForOpcode 0x${opcode.toString(16)}`);

      this.deserializer.OnObjectDeserialized(opcode.toString())
        .one((scope: any, packet: T) => {
          resolve(packet);
        });
    });
  }

  private handleChallenge(challenge: SAuthChallenge) {
    return new Promise((resolve, reject) => {
      if (this.session == null) {
        reject();
        return;
      }

      const salt = challenge.Salt;
      const seed = BigNum.fromRand(4);

      const hash = new SHA1();
      hash.feed(this.session.account);
      hash.feed([0, 0, 0, 0]);
      hash.feed(seed.toArray());
      hash.feed(salt);
      hash.feed(this.session.key);

      log.debug('seed: ' + this.toHexString(seed.toArray()));
      log.debug('salt: ' + this.toHexString(salt));
      log.debug('key: ' + this.toHexString(this.session.key));

      const build = this.session.build;
      const account = this.session.account;

      const authProof = new AuthProof();
      authProof.Build = build;
      authProof.LoginServerId = 0;
      authProof.Account = account;
      authProof.Seed = seed.toArray();
      authProof.Digest = hash.digest;
      this.serializer.Serialize(authProof);

      if (this.crypt && this.session.key) {
        this.crypt.Init(this.session.key);
        this.deserializer.Encryption = this.crypt;
        this.serializer.Encryption = this.crypt;
      }

      resolve();
    });
  }

  private HandleAuthResponse(authResponse: SAuthResponse) {
    return new Promise((resolve, reject) => {
      if (authResponse.Result === 0x0D) {
        // log.warn('server-side auth/realm failure; try again');
        reject('server-side auth/realm failure; try again');
      }
      else if (authResponse.Result === 0x15) {
        // log.warn('account in use/invalid; aborting');
        reject('account in use/invalid; aborting');
      }
      else if (authResponse.Result !== 12) {
        // log.warn('auth response error:' + authResponse.Result);
        reject('auth response error:' + authResponse.Result);
      }

      resolve();
    });
  }

  // Connects to given host through given port
  public async connectToRealm(session: ISession, realm: IRealm) {
    this.session = session;
    this.realm = realm;

    await this.socket.connect(realm.Host, realm.Port);
    const challenge = await this.waitForOpcode<SAuthChallenge>(GameOpcode.SMSG_AUTH_CHALLENGE);
    await this.handleChallenge(challenge);
    const response = await this.waitForOpcode<SAuthResponse>(GameOpcode.SMSG_AUTH_RESPONSE);
    await this.HandleAuthResponse(response);

    return this;
  }

  public async getChars() {
    const charEnum = new CMsgCharEnum();
    this.serializer.Serialize(charEnum);

    const characters = await this.waitForOpcode<SMsgCharEnum>(GameOpcode.SMSG_CHAR_ENUM);

    return characters.Characters;
  }

  public async join(character: Character) {
    log.info('joining game with', character.toString());

    const login = new CMsgPlayerLogin();
    login.Guid = character.Guid;

    this.serializer.Serialize(login);

    const loginVerify = await this.waitForOpcode<ServerPacket>(GameOpcode.SMSG_LOGIN_VERIFY_WORLD);

  }

  public async disconnect() {
    const logoutRequest = new CMsgLogoutRequest();
    this.serializer.Serialize(logoutRequest);

    await this.socket.disconnect();

    /* TODO: eventually handle waiting for the logout response
    const logoutResponse = await this.waitForOpcode<SMsgLogoutResponse>(GameOpcode.SMSG_LOGOUT_RESPONSE);
    log.info('logout ', logoutResponse.Reason, logoutResponse.Result);
    */
  }

  public toHexString(byteArray: any) {
    return Array.from(byteArray, (byte: any) => {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join(':');
  }

  private HandleCompressedUpdateObject(packet: any): void {
    log.debug('HandleCompressedUpdateObject');
    packet.readUint16(); // size
    packet.readUint16(); // opcode
  }
}

export default GameHandler;
