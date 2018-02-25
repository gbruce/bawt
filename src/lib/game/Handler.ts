import * as ByteBuffer from 'bytebuffer';

import BigNum from '../crypto/BigNum';
import { ICrypt } from '../../interface/ICrypt';
import WowCrypt from '../crypto/WowCrypt';
import RC4Crypt from '../crypto/RC4Crypt';
import GameOpcode from './Opcode';
import SHA1 from '../crypto/hash/SHA1';
import * as process from 'process';
import { NewLogger } from '../utils/Logger';
import { IRealm } from '../../interface/IRealm';
import { setInterval } from 'timers';
import { GetVersion, Version } from '../utils/Version';
import { ISocket, SocketEvent } from '../../interface/ISocket';
import { ISession } from '../../interface/ISession';
import { IFactory } from '../../interface/IFactory';
import { IPacket } from '../../interface/IPacket';
import { EventEmitter } from 'events';
import { SAuthChallenge, NewSAuthChallenge } from './packets/server/AuthChallenge';
import { SAuthResponse, NewSAuthResponse } from './packets/server/AuthResponse';
import { SMsgLoginVerifyWorld, NewSMsgLoginVerifyWorld } from './packets/server/SMsgLoginVerifyWorld';
import { SMsgSetProficiency, NewSMsgSetProficiency } from './packets/server/SMsgSetProficiency';
import { SMsgSpellOGMiss, NewSMsgSpellOGMiss } from './packets/server/SMsgSpellOGMiss';
import { CMsgPlayerLogin } from './packets/client/CMsgPlayerLogin';
import { NewServerPacket, ServerPacket } from './packets/server/ServerPacket';
import { CMsgCharEnum } from './packets/client/CMsgCharEnum';
import { SMsgCharEnum, NewSMsgCharEnum, Character } from './packets/server/SMsgCharEnum';
import { SerializeObjectToBuffer } from '../net/Serialization';
import { Serializer, GameHeaderSerializer } from '../net/Serializer';
import { Deserializer, GameHeaderDeserializer } from '../net/Deserializer';
import { AuthProof } from './packets/client/AuthProof';
const log = NewLogger('game/Handler');

const readIntoByteArray = (bytes: number, bb: ByteBuffer) => {
  const result = [];
  for (let i = 0; i < bytes; i++) {
    result.push(bb.readUint8());
  }
  return result;
};

const sOpcodeMap = new Map<number, IFactory<IPacket>>([
  [GameOpcode.SMSG_AUTH_CHALLENGE, new NewSAuthChallenge()],
  [GameOpcode.SMSG_AUTH_RESPONSE, new NewSAuthResponse()],
  [GameOpcode.SMSG_CHAR_ENUM, new NewSMsgCharEnum()],
  [GameOpcode.SMSG_WARDEN_DATA, new NewServerPacket()],
  [GameOpcode.SMSG_ADDON_INFO, new NewServerPacket()],
  [GameOpcode.SMSG_LOGIN_VERIFY_WORLD, new NewServerPacket()],
  [GameOpcode.SMSG_FORCE_MOVE_UNROOT, new NewServerPacket()],
  [GameOpcode.SMSG_LOGIN_VERIFY_WORLD, new NewSMsgLoginVerifyWorld()],
  [GameOpcode.SMSG_SET_PROFICIENCY, new NewSMsgSetProficiency()],
  [GameOpcode.SMSG_SPELLLOGMISS, new NewSMsgSpellOGMiss()],
]);

class GameHandler extends EventEmitter {
  private session: ISession;
  private useCrypt = false;
  private crypt: ICrypt|null = null;
  private realm: IRealm|null = null;
  private pingCount: number = 1;
  private socket: ISocket;
  private serializer: Serializer;
  private deserializer: Deserializer;

  // Creates a new game handler
  constructor(session: ISession, socketFactory: IFactory<ISocket>) {
    super();

    this.socket = socketFactory.Create();
    this.serializer = new Serializer(GameHeaderSerializer);
    this.deserializer = new Deserializer(GameHeaderDeserializer, sOpcodeMap);
    this.serializer.OnPacketSerialized.sub((buffer) => this.socket.sendBuffer(buffer));

    this.socket.OnDataReceived.sub((arrayBuffer) => this.deserializer.Deserialize(arrayBuffer));

    // Holds session
    this.session = session;

    this.on('packet:receive:SMSG_COMPRESSED_UPDATE_OBJECT', (packet: any) => {
      // this.HandleCompressedUpdateObject(packet);
    });

    this.on('packet:receive:SMSG_ACCOUNT_DATA_TIMES', (packet: any) => {
    });

    this.on('packet:receive:SMSG_PONG', (packet: any) => {
      packet.readUint16(); // size
      packet.readUint16(); // opcode
      const pingCount = packet.readUint32(); // size
      log.info(`Pong ${pingCount}`);
    });

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

      const build = this.session.config.build;
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
  public async connectToRealm(realm: IRealm) {
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
