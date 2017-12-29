import * as ByteBuffer from 'bytebuffer';

import BigNum from '../crypto/BigNum';
import Crypt from '../crypto/Crypt';
import GameOpcode from './Opcode';
import GamePacket from './Packet';
import GUID from '../game/Guid';
import SHA1 from '../crypto/hash/SHA1';
import Socket from '../net/Socket';
import Character from '../characters/Character';
import * as process from 'process';
import { NewLogger } from '../utils/Logger';
import Realm from 'lib/realms/Realm';
import Guid from '../game/Guid';
import { setInterval } from 'timers';

const Log = NewLogger('game/Handler');

const ReadIntoByteArray = (bytes: number, bb: ByteBuffer) => {
  const result = [];
  for (let i = 0; i < bytes; i++) {
    result.push(bb.readUint8());
  }
  return result;
};

class GameHandler extends Socket {
  // tslint:disable-next-line:max-line-length
  private AddOnHex = '9e020000789c75d2c16ac3300cc671ef2976e99becb4b450c2eacbe29e8b627f4b446c39384eb7f63dfabe65b70d94f34f48f047afc69826f2fd4e255cdefdc8b82241eab9352fe97b7732ffbc404897d557cea25a43a54759c63c6f70ad115f8c182c0b279ab52196c032a80bf61421818a4639f5544f79d834879faae001fd3ab89ce3a2e0d1ee47d20b1d6db7962b6e3ac6db3ceab2720c0dc9a46a2bcb0caf1f6c2b5297fd84ba95c7922f59954fe2a082fb2daadf739c60496880d6dbe509fa13b84201ddc4316e310bca5f7b7b1c3e9ee193c88d';
  private addOnBuffer: ByteBuffer;
  private session: any;
  private crypt: Crypt|null = null;
  private realm: Realm|null = null;
  private pingCount: number = 1;

  // Creates a new game handler
  constructor(session: any) {
    super();

    // Holds session
    this.session = session;

    // Listen for incoming data
    this.on('data:receive', (packet: Buffer) => {
      this.dataReceived(packet);
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
      Log.info(`Pong ${pingCount}`);
    });

    this.addOnBuffer = ByteBuffer.fromHex(this.AddOnHex);
  }

  public RequestRealmSplitState() {
    if (!this.connected) {
      return false;
    }

    const packet = new GamePacket(GameOpcode.CMSG_REALM_SPLIT, 10);
    packet.writeUint32(1);
    this.send(packet);
  }

  public NotifyReadyForAccountDataTimes() {
    if (!this.connected) {
      return false;
    }

    return this.send(new GamePacket(GameOpcode.CMSG_READY_FOR_ACCOUNT_DATA_TIMES, 6));
  }

  // Connects to given host through given port
  public connectToRealm(realm: Realm) {
    if (!this.connected) {
      this.realm = realm;
      super.connect(realm.host, realm.port);
    }
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
      const array = ReadIntoByteArray(6, packet);
      this.crypt.encrypt(array);
      packet.offset = 0;
      packet.writeUint8(array[0]);
      packet.writeUint8(array[1]);
      packet.writeUint8(array[2]);
      packet.writeUint8(array[3]);
      packet.writeUint8(array[4]);
      packet.writeUint8(array[5]);
    }

    return super.send(packet);
  }

  // Attempts to join game with given character
  public join(character: Character) {
    if (character) {
      Log.info('joining game with', character.toString());

      const gp = new GamePacket(GameOpcode.CMSG_PLAYER_LOGIN, 14);
      gp.writeGUID(character.guid);
      return this.send(gp);
    }

    return false;
  }

  public toHexString(byteArray: any) {
    return Array.from(byteArray, (byte: any) => {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join(':');
  }

  private HandleCompressedUpdateObject(packet: GamePacket): void {
    packet.readUint16(); // size
    packet.readUint16(); // opcode
  }

  // Data received handler
  private dataReceived(buffer: Buffer) {
    if (!this.connected) {
      return;
    }

    let offset = 0;
    while (offset < buffer.byteLength) {
      const header = buffer.subarray(offset, offset + 4);
      // Only the packet size and opcode are encrypted.
      // 2 bytes (big endian) for the size
      // 2 bytes (little endian) for the opcode
      if (this.crypt) {
        this.crypt.decrypt(header);
      }
      const size = buffer.readUInt16BE(offset) + 2;
      const opcode = buffer.readUInt16LE(offset + 2);

      const packetSubarray = buffer.subarray(offset, size);
      const packet = new GamePacket(opcode, size, false);
      packet.append(packetSubarray);
      packet.offset = 0;

      Log.info(`<== [Packet opcode:${packet.opcodeName} size:${size}]`);

      this.emit('packet:receive', packet);
      if (packet.opcodeName) {
        this.emit(`packet:receive:${packet.opcodeName}`, packet);
      }

      offset += size;
    }
  }

  // Auth challenge handler (SMSG_AUTH_CHALLENGE)
  private handleAuthChallenge(gp: GamePacket) {
    Log.info('handling auth challenge');
    gp.littleEndian = false;
    gp.readUint16(); // size
    gp.littleEndian = true;
    gp.readUint16(); // opcode

    gp.readUint32();
    const salt = ReadIntoByteArray(4, gp);
    const seed = BigNum.fromRand(4);

    const hash = new SHA1();
    hash.feed(this.session.account);
    hash.feed([0, 0, 0, 0]);
    hash.feed(seed.toArray());
    hash.feed(salt);
    hash.feed(this.session.key);

    Log.debug('seed: ' + this.toHexString(seed.toArray()));
    Log.debug('salt: ' + this.toHexString(salt));
    Log.debug('key: ' + this.toHexString(this.session.key));

    const build = this.session.config.build;
    const account = this.session.account;

    // const size = GamePacket.HEADER_SIZE_OUTGOING + 8 + this.session.account.length + 1 + 4 + 4 + 20 + 20 + 4;
    const size = 0;

    const app = new GamePacket(GameOpcode.CMSG_AUTH_PROOF);
    app.LE();
    app.writeUint32(build); // build
    app.writeUint32(0);     // (?) login server id
    app.writeCString(account);   // account
    app.writeUint32(0);     // (?) login server type
    app.append(seed.toArray());

    app.writeUint32(0); // region id
    app.writeUint32(0); // battlegroup id
    if (this.realm) {
      app.writeUint32(this.realm.id); // realm id
    }
    app.writeUint64(0); // dos response
    app.append(hash.digest);
    Log.debug('dig: ' + this.toHexString(hash.digest));
    app.append(this.addOnBuffer);

    this.send(app);

    this.crypt = new Crypt();
    this.crypt.key = this.session.key;
  }

  // Auth response handler (SMSG_AUTH_RESPONSE)
  private handleAuthResponse(gp: GamePacket) {
    Log.info('handling auth response');

    gp.readUint16(); // size
    gp.readUint16(); // opcode

    // Handle result byte
    const result = gp.readUint8();
    if (result === 0x0D) {
      Log.warn('server-side auth/realm failure; try again');
      this.emit('reject');
      return;
    }

    if (result === 0x15) {
      Log.warn('account in use/invalid; aborting');
      this.emit('reject');
      return;
    }

    if (result !== 12) {
      Log.warn('auth response error:' + result);
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
