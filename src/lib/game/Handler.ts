import * as ByteBuffer from 'bytebuffer';

import BigNum from '../crypto/BigNum';
import Crypt from '../crypto/crypt';
import GameOpcode from './opcode';
import GamePacket from './packet';
import GUID from '../game/guid';
import SHA1 from '../crypto/hash/sha1';
import Socket from '../net/socket';
import Character from '../characters/Character';

const ReadIntoByteArray = function(bytes: number, bb: ByteBuffer) {
  const result = [];
  for(let i=0; i<bytes; i++) {
    result.push(bb.readUint8());
  }
  return result;
};

class GameHandler extends Socket {
  private AddOnHex ='9e020000789c75d2c16ac3300cc671ef2976e99becb4b450c2eacbe29e8b627f4b446c39384eb7f63dfabe65b70d94f34f48f047afc69826f2fd4e255cdefdc8b82241eab9352fe97b7732ffbc404897d557cea25a43a54759c63c6f70ad115f8c182c0b279ab52196c032a80bf61421818a4639f5544f79d834879faae001fd3ab89ce3a2e0d1ee47d20b1d6db7962b6e3ac6db3ceab2720c0dc9a46a2bcb0caf1f6c2b5297fd84ba95c7922f59954fe2a082fb2daadf739c60496880d6dbe509fa13b84201ddc4316e310bca5f7b7b1c3e9ee193c88d';
  private addOnBuffer: ByteBuffer;
  private session: any;
  private _crypt: Crypt|null = null;

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

    this.addOnBuffer = ByteBuffer.fromHex(this.AddOnHex);
  }

  // Connects to given host through given port
  connect(host: string, port: number) {
    if (!this.connected) {
      super.connect(host, port);
      console.info('connecting to game-server @', this.host, ':', this.port);
    }
    return this;
  }

  // Finalizes and sends given packet
  send(packet: GamePacket) {    
    const size = packet.offset;//  + GamePacket.OPCODE_SIZE_OUTGOING;

    packet.BE();
    packet.offset = 0;
//    packet.littleEndian = false;
    packet.writeUint16(size-2);
//    packet.littleEndian = true;

    // Encrypt header if needed
    if (this._crypt) {
      this._crypt.encrypt(new Uint8Array(packet.buffer, 0, GamePacket.HEADER_SIZE_OUTGOING));
    }

    return super.send(packet);
  }

  // Attempts to join game with given character
  join(character: Character) {
    if (character) {
      console.info('joining game with', character.toString());

      const gp = new GamePacket(GameOpcode.CMSG_PLAYER_LOGIN, GamePacket.HEADER_SIZE_OUTGOING + GUID.LENGTH);
      gp.writeGUID(character.guid);
      return this.send(gp);
    }

    return false;
  }

  // Data received handler
  dataReceived(buffer: Buffer) {
    if (!this.connected) {
      return;
    }

    const size = buffer.readUInt16BE(0);
    const opcode = buffer.readUInt16LE(2);

    const packet = new GamePacket(opcode, size, false);
    packet.append(buffer);
    packet.offset = 0;

    console.log('<==', packet.toString());

    this.emit('packet:receive', packet);
    if (packet.opcodeName) {
      this.emit(`packet:receive:${packet.opcodeName}`, packet);
    }

    /*
      if (this.remaining === false) {

        if (this.buffer.available < GamePacket.HEADER_SIZE_INCOMING) {
          return;
        }

        // Decrypt header if needed
        if (this._crypt) {
          this._crypt.decrypt(new Uint8Array(this.buffer.buffer, this.buffer.index, GamePacket.HEADER_SIZE_INCOMING));
        }

        this.remaining = this.buffer.readUnsignedShort(ByteBuffer.BIG_ENDIAN);
      }

      if (this.remaining > 0 && this.buffer.available >= this.remaining) {
        const size = GamePacket.OPCODE_SIZE_INCOMING + this.remaining;
        const gp = new GamePacket(this.buffer.readUnsignedShort(), this.buffer.seek(-GamePacket.HEADER_SIZE_INCOMING).read(size), false);

        this.remaining = false;

        console.log('⟹', gp.toString());
        // console.debug gp.toHex()
        // console.debug gp.toASCII()

        this.emit('packet:receive', gp);
        if (gp.opcodeName) {
          this.emit(`packet:receive:${gp.opcodeName}`, gp);
        }

      } else if (this.remaining !== 0) {
        return;
      }
    }
    */
  }

  toHexString(byteArray: any) {
    return Array.from(byteArray, function(byte: any) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join(':')
  }

  // Auth challenge handler (SMSG_AUTH_CHALLENGE)
  handleAuthChallenge(gp: GamePacket) {
    console.info('handling auth challenge');
    gp.littleEndian = false;
    const sz = gp.readUint16();
    gp.littleEndian = true;
    const opcode = gp.readUint16();

    gp.readUint32();
    const salt = ReadIntoByteArray(4, gp);
    const seed = BigNum.fromRand(4);

    const hash = new SHA1();
    hash.feed(this.session.account);
    hash.feed([0, 0, 0, 0]);
    hash.feed(seed.toArray());
    hash.feed(salt);
    hash.feed(this.session.key);

    console.log('seed: ' + this.toHexString(seed.toArray()));
    console.log('salt: ' + this.toHexString(salt));
    console.log('key: ' + this.toHexString(this.session.key));

    const build = this.session.config.build;
    const account = this.session.account;


    // const size = GamePacket.HEADER_SIZE_OUTGOING + 8 + this.session.account.length + 1 + 4 + 4 + 20 + 20 + 4;
    const size = 0;

    const app = new GamePacket(GameOpcode.CMSG_AUTH_PROOF);
    app.LE();
    app.writeUint32(build); // build
    app.writeUint32(0);     // (?)
    app.writeCString(account);   // account
    app.writeUint32(0);     // (?)
    app.append(seed.toArray());

    app.writeUint64(0);
    app.writeUint32(0x2c);
    app.writeUint32(0);
    app.writeUint32(0);
    app.append(hash.digest);
    console.log('dig: ' + this.toHexString(hash.digest));
//    app.writeUint32(0);
    app.append(this.addOnBuffer);
    // app.writeUnsignedInt(0);     // (?)
    // app.writeUnsignedInt(0);     // (?)
    // app.writeUnsignedInt(0);     // (?)
    // app.writeUnsignedInt(0);     // (?)
    // app.writeUnsignedInt(0);     // (?)
    // app.write(hash.digest);      // digest
    // app.writeUnsignedInt(0);     // addon-data


    this.send(app);

    this._crypt = new Crypt();
    this._crypt.key = this.session.key;
  }

  // Auth response handler (SMSG_AUTH_RESPONSE)
  handleAuthResponse(gp: GamePacket) {
    console.info('handling auth response');

    // Handle result byte
    const result = gp.readUint8();
    if (result === 0x0D) {
      console.warn('server-side auth/realm failure; try again');
      this.emit('reject');
      return;
    }

    if (result === 0x15) {
      console.warn('account in use/invalid; aborting');
      this.emit('reject');
      return;
    }

    // TODO: Ensure the account is flagged as WotLK (expansion //2)

    this.emit('authenticate');
  }

  // World login handler (SMSG_LOGIN_VERIFY_WORLD)
  handleWorldLogin(_gp: any) {
    this.emit('join');
  }

}

export default GameHandler;