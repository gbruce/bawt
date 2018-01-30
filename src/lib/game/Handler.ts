import * as ByteBuffer from 'bytebuffer';

import BigNum from '../crypto/BigNum';
import { Crypt } from '../../interface/Crypt';
import WowCrypt from '../crypto/WowCrypt';
import RC4Crypt from '../crypto/RC4Crypt';
import GameOpcode from './Opcode';
import GamePacket from './Packet';
import GUID from '../game/Guid';
import SHA1 from '../crypto/hash/SHA1';
import Character from '../characters/Character';
import * as process from 'process';
import { NewLogger } from '../utils/Logger';
import { Realm } from '../auth/packets/server/RealmList';
import Guid from '../game/Guid';
import { setInterval } from 'timers';
import { GetVersion, Version } from '../utils/Version';
import { Socket, SocketEvent } from '../../interface/Socket';
import { Session } from '../../interface/Session';
import { Factory } from '../../interface/Factory';
import { EventEmitter } from 'events';

const log = NewLogger('game/Handler');

const readIntoByteArray = (bytes: number, bb: ByteBuffer) => {
  const result = [];
  for (let i = 0; i < bytes; i++) {
    result.push(bb.readUint8());
  }
  return result;
};

class GameHandler extends EventEmitter {
  // tslint:disable-next-line:max-line-length
  private addOnHex = '9e020000789c75d2c16ac3300cc671ef2976e99becb4b450c2eacbe29e8b627f4b446c39384eb7f63dfabe65b70d94f34f48f047afc69826f2fd4e255cdefdc8b82241eab9352fe97b7732ffbc404897d557cea25a43a54759c63c6f70ad115f8c182c0b279ab52196c032a80bf61421818a4639f5544f79d834879faae001fd3ab89ce3a2e0d1ee47d20b1d6db7962b6e3ac6db3ceab2720c0dc9a46a2bcb0caf1f6c2b5297fd84ba95c7922f59954fe2a082fb2daadf739c60496880d6dbe509fa13b84201ddc4316e310bca5f7b7b1c3e9ee193c88d';
  // tslint:disable-next-line:max-line-length
  private addOnHex2 = '56010000789c75ccbd0ec2300c04e0f21ebc0c614095c842c38c4ce2220bc7a98ccb4f9f1e16240673eb777781695940cb693367a326c7be5bd5c77adf7d12be16c08c7124e41249a8c2e495480ac9c53dd8b67a064bf8340f15467367bb38cc7ac7978bbddc26ccfe3042d6e6ca01a8b8908051fcb7a45070b812f33f2641fdb5379019668f';
  private addOnBuffer: ByteBuffer;
  private session: Session;
  private useCrypt = false;
  private crypt: Crypt|null = null;
  private realm: Realm|null = null;
  private pingCount: number = 1;
  private socket: Socket;

  // Creates a new game handler
  constructor(session: Session, socketFactory: Factory<Socket>) {
    super();

    this.socket = socketFactory.Create();

    // Holds session
    this.session = session;

    // Listen for incoming data
    this.socket.on(SocketEvent.OnDataReceived, (args: any[]) => {
      this.dataReceived(args[0]);
    });

    this.socket.on(SocketEvent.OnConnected, () => {
      this.emit('connect');
    });

    // Delegate packets
    this.on('packet:receive:SMSG_AUTH_CHALLENGE', (packet: any) => {
      this.handleAuthChallenge(packet);
    });

    this.on('packet:receive:SMSG_AUTH_RESPONSE', (packet: any) => {
      this.handleAuthResponse(packet);
    });

    this.on('packet:receive:SMSG_LOGIN_VERIFY_WORLD', (packet: any) => {
      this.handleWorldLogin(packet);
    });

    this.on('packet:receive:SMSG_COMPRESSED_UPDATE_OBJECT', (packet: any) => {
      this.HandleCompressedUpdateObject(packet);
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
      this.addOnBuffer = ByteBuffer.fromHex(this.addOnHex2);
    }
    else {
      this.crypt = new RC4Crypt();
      this.addOnBuffer = ByteBuffer.fromHex(this.addOnHex);
    }
  }

  // Connects to given host through given port
  public connectToRealm(realm: Realm) {
    this.realm = realm;
    this.socket.connect(realm.Host, realm.Port);
    return this;
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

  // Attempts to join game with given character
  public join(character: Character) {
    log.info('joining game with', character.toString());

    const gp = new GamePacket(GameOpcode.CMSG_PLAYER_LOGIN, 14);
    gp.writeGUID(character.guid);
    return this.send(gp);
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

  // Data received handler
  private dataReceived(buffer: Buffer) {
    let offset = 0;
    while (offset < buffer.byteLength) {
      const header = buffer.subarray(offset, offset + 4);
      // Only the packet size and opcode are encrypted.
      // 2 bytes (big endian) for the size
      // 2 bytes (little endian) for the opcode
      if (this.crypt && this.useCrypt) {
        this.crypt.Decrypt(header, header.length);
      }
      const size = buffer.readUInt16BE(offset) + 2;
      const opcode = buffer.readUInt16LE(offset + 2);

      const packetSubarray = buffer.subarray(offset, size);
      const packet = new GamePacket(opcode, size, false);
      packet.append(packetSubarray);
      packet.offset = 0;

      log.info(`<== [Packet opcode:${packet.opcodeName} size:${size} offset:${offset}]`);

      this.emit('packet:receive', packet);
      if (packet.opcodeName) {
        this.emit(`packet:receive:${packet.opcodeName}`, packet);
      }

      offset += size;
    }
  }

  // Auth challenge handler (SMSG_AUTH_CHALLENGE)
  private handleAuthChallenge(gp: GamePacket) {
    log.info('handling auth challenge');
    gp.littleEndian = false;
    gp.readUint16(); // size
    gp.littleEndian = true;
    gp.readUint16(); // opcode

    if (GetVersion() === Version.WoW_3_3_5) {
      gp.readUint32();
    }

    const salt = readIntoByteArray(4, gp);
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

    // const size = GamePacket.HEADER_SIZE_OUTGOING + 8 + this.session.account.length + 1 + 4 + 4 + 20 + 20 + 4;
    const size = 0;

    const app = new GamePacket(GameOpcode.CMSG_AUTH_PROOF);
    app.LE();
    app.writeUint32(build); // build
    app.writeUint32(0);     // (?) login server id
    app.writeCString(account);   // account
    if (GetVersion() === Version.WoW_3_3_5) {
      app.writeUint32(0);     // (?) login server type
    }
    app.append(seed.toArray());

    if (GetVersion() === Version.WoW_3_3_5) {
      app.writeUint32(0); // region id
      app.writeUint32(0); // battlegroup id
      if (this.realm) {
        app.writeUint32(this.realm.id); // realm id
      }
      app.writeUint64(0); // dos response
    }

    app.append(hash.digest);
    log.debug('dig: ' + this.toHexString(hash.digest));
    app.append(this.addOnBuffer);

    this.send(app);
    if (this.crypt && this.session.key) {
      this.crypt.Init(this.session.key);
      this.useCrypt = true;
    }
  }

  // Auth response handler (SMSG_AUTH_RESPONSE)
  private handleAuthResponse(gp: GamePacket) {
    log.info('handling auth response');

    gp.readUint16(); // size
    gp.readUint16(); // opcode

    // Handle result byte
    const result = gp.readUint8();
    if (result === 0x0D) {
      log.warn('server-side auth/realm failure; try again');
      this.emit('reject');
      return;
    }

    if (result === 0x15) {
      log.warn('account in use/invalid; aborting');
      this.emit('reject');
      return;
    }

    if (result !== 12) {
      log.warn('auth response error:' + result);
      this.emit('reject');
      return;
    }

    // TODO: Ensure the account is flagged as WotLK (expansion //2)
    this.emit('authenticate');

    this.ping();
    setInterval(() => this.ping(), 30000);
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

  // World login handler (SMSG_LOGIN_VERIFY_WORLD)
  private handleWorldLogin(gp: any) {
    this.emit('join');
  }

}

export default GameHandler;
