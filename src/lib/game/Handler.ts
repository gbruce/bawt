import * as ByteBuffer from 'bytebuffer';

import BigNum from '../crypto/BigNum';
import { Crypt } from '../../interface/Crypt';
import WowCrypt from '../crypto/WowCrypt';
import RC4Crypt from '../crypto/RC4Crypt';
import GameOpcode from './Opcode';
import GamePacket from './Packet';
import GUID from '../game/Guid';
import SHA1 from '../crypto/hash/SHA1';
import * as process from 'process';
import { NewLogger } from '../utils/Logger';
import { Realm } from '../../interface/Realm';
import Guid from '../game/Guid';
import { setInterval } from 'timers';
import { GetVersion, Version } from '../utils/Version';
import { Socket, SocketEvent } from '../../interface/Socket';
import { Session } from '../../interface/Session';
import { Factory } from '../../interface/Factory';
import { Packet } from '../../interface/Packet';
import { EventEmitter } from 'events';
import { GameSession } from './GameSession';
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

const sOpcodeMap = new Map<number, Factory<Packet>>([
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
  private session: Session;
  private useCrypt = false;
  private crypt: Crypt|null = null;
  private realm: Realm|null = null;
  private pingCount: number = 1;
  private socket: Socket;
  private serializer: Serializer;
  private deserializer: Deserializer;

  // Creates a new game handler
  constructor(session: Session, socketFactory: Factory<Socket>) {
    super();

    this.socket = socketFactory.Create();
    this.serializer = new Serializer(GameHeaderSerializer);
    this.deserializer = new Deserializer(GameHeaderDeserializer, sOpcodeMap);
    this.serializer.OnPacketSerialized.sub((buffer) => this.socket.sendBuffer(buffer));

    this.socket.on(SocketEvent.OnDataReceived, (args: any[]) => this.deserializer.Deserialize(args[0]));

    // Holds session
    this.session = session;

    this.on('packet:receive:SMSG_COMPRESSED_UPDATE_OBJECT', (packet: any) => {
      // this.HandleCompressedUpdateObject(packet);
    });

    this.on('packet:receive:SMSG_ACCOUNT_DATA_TIMES', (packet: any) => {
    });

    this.on('packet:receive:SMSG_PONG', (packet: GamePacket) => {
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

  private connectInternal(realm: Realm): Promise<GameSession> {
    return new Promise((resolve, reject) => {
      this.socket.on(SocketEvent.OnConnected, () => {
        resolve();
      });
      this.socket.connect(realm.Host, realm.Port);
    });
  }

  // Connects to given host through given port
  public async connectToRealm(realm: Realm) {
    this.realm = realm;

    await this.connectInternal(realm);
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

  // Finalizes and sends given packet
  public send(packet: GamePacket) {
    const size = packet.offset;

    packet.BE();
    packet.offset = 0;
    packet.writeUint16(size - 2);

    // Encrypt header
    if (this.crypt) {
      packet.offset = 0;
      const array = readIntoByteArray(6, packet);
      this.crypt.Encrypt(array, array.length);
      packet.offset = 0;
      packet.writeUint8(array[0]);
      packet.writeUint8(array[1]);
      packet.writeUint8(array[2]);
      packet.writeUint8(array[3]);
      packet.writeUint8(array[4]);
      packet.writeUint8(array[5]);
    }

    return this.socket.send(packet);
  }

  public toHexString(byteArray: any) {
    return Array.from(byteArray, (byte: any) => {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join(':');
  }

  private HandleCompressedUpdateObject(packet: GamePacket): void {
    log.debug('HandleCompressedUpdateObject');
    packet.readUint16(); // size
    packet.readUint16(); // opcode
  }

  private ping() {
    const gp = new GamePacket(GameOpcode.CMSG_PING, 14);
    gp.writeUint32(this.pingCount); // ping
    gp.writeUint32(50); // latency

    this.pingCount++;
    return this.send(gp);
  }

  private handlePong(gp: GamePacket) {

  }
}

export default GameHandler;
