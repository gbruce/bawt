
import * as ByteBuffer from 'bytebuffer';
import { Session } from '../../interface/Session';
import SRP from '../crypto/SRP';
import { NewLogger } from '../utils/Logger';
import AuthChallengeOpcode from './ChallengeOpcode';
import AuthOpcode from './Opcode';
import AuthPacket from './Packet';
import { Factory } from '../../interface/Factory';
import { Socket, SocketEvent } from '../../interface/Socket';
import { EventEmitter } from 'events';
import Packet from '../net/Packet';

const log = NewLogger('AuthHandler');

const readIntoByteArray = (bytes: number, bb: ByteBuffer) => {
  const result = [];
  for (let i = 0; i < bytes; i++) {
    result.push(bb.readUint8());
  }
  return result;
};

interface Result<T> {
  success: boolean;
  result: T|null;
}

interface LogonChallengeResult {
  B: number[];
  g: number[];
  N: number[];
  salt: number[];
}

function ToHexString(byteArray: any) {
  return Array.from(byteArray, (byte: any) => {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join(':');
}

// LOGON_CHALLENGE
export function DeserializeLogonChallenge(ap: AuthPacket): Result<LogonChallengeResult> {
  log.debug('DeserializeLogonChallenge');

  const code = ap.readUint8();
  ap.readUint8();
  const status = ap.readUint8();

  if (status === AuthChallengeOpcode.SUCCESS) {
    log.debug('auth challenge success');

    const B = readIntoByteArray(32, ap);
    const glen = ap.readUint8(); // g-length
    const g = readIntoByteArray(glen, ap);
    const nlen = ap.readUint8(); // n-length
    const N = readIntoByteArray(nlen, ap);
    const salt = readIntoByteArray(32, ap);

    return {
      success: true,
      result: { B, g, N, salt },
    };
  }

  return {
    success: false,
    result: null,
  };
}

export function NewLogonProofPacket(srp: SRP) {
  const packet = new AuthPacket(AuthOpcode.LOGON_PROOF, 1 + 32 + 20 + 20 + 2);
  packet.writeUint8(AuthOpcode.LOGON_PROOF);
  packet.append(srp.A.toArray());
  log.info(' A: ' + ToHexString(srp.A.toArray()));
  if (srp.M1) {
    log.info('M1: ' + ToHexString(srp.M1.digest));
    packet.append(srp.M1.digest);
  }
  packet.append(new Uint8Array(20)); // CRC hash
  packet.writeByte(0x00);      // number of keys
  packet.writeByte(0x00);      // security flags

  return packet;
}

class AuthHandler extends EventEmitter {
  // Default port for the auth-server
  public static PORT = 3724;

  public account: string;
  private session: Session;
  private password: string|null;
  private srp: SRP|null;
  private socket: Socket;

  // Creates a new authentication handler
  constructor(session: Session, socketFactory: Factory<Socket>) {
    super();

    this.socket = socketFactory.Create();

    // Holds session
    this.session = session;

    // Holds credentials for this session (if any)
    this.password = null;

    // Holds Secure Remote Password implementation
    this.srp = null;

    // Listen for incoming data
    this.socket.on(SocketEvent.OnDataReceived, (args: any[]) => {
      this.dataReceived(args[0]);
    });
    this.socket.on(SocketEvent.OnConnected, () => {
      this.emit('connect');
    });

    // Delegate packets
    this.on('packet:receive:LOGON_CHALLENGE', this.handleLogonChallenge);
    this.on('packet:receive:LOGON_PROOF', this.handleLogonProof);
  }

  // Retrieves the session key (if any)
  get key(): number[]|null {
    return this.srp && this.srp.K;
  }

  public send(packet: Packet): boolean {
    return this.socket.send(packet);
  }

  // Connects to given host through given port
  public connect(host: string, port: number = NaN) {
    this.socket.connect(host, port || AuthHandler.PORT);
    log.info('connecting to auth-server @', host, ':', port);
    return this;
  }

  // Sends authentication request to connected host
  public authenticate(account: any, password: string) {
    this.account = account.toUpperCase();
    this.password = password.toUpperCase();

    log.info('authenticating ', this.account);

    // Extract configuration data
    const {
      build,
      majorVersion,
      minorVersion,
      patchVersion,
      game,
      raw: {
        os, locale, platform,
      },
      timezone,
    } = this.session.config;

    const ap = new AuthPacket(AuthOpcode.LOGON_CHALLENGE, 34 + this.account.length);
    ap.writeUint8(AuthOpcode.LOGON_CHALLENGE);
    ap.writeUint8(0x08);
    ap.writeUint16(30 + this.account.length);
    ap.WriteString(game);         // game string
    ap.writeUint8(0);
    ap.writeUint8(majorVersion);    // v1 (major)
    ap.writeUint8(minorVersion);    // v2 (minor)
    ap.writeUint8(patchVersion);    // v3 (patch)
    ap.writeUint16(build);          // build
    ap.WriteString(platform);      // platform
    ap.writeUint8(0);
    ap.WriteString(os);            // os
    ap.writeUint8(0);
    ap.WriteString(locale);        // locale
    ap.writeUint32(timezone); // timezone
    ap.writeUint8(127);
    ap.writeUint8(0);
    ap.writeUint8(0);
    ap.writeUint8(1);
    ap.writeByte(this.account.length); // account length
    ap.WriteString(this.account);      // account

    this.socket.send(ap);
  }

  // Data received handler
  private dataReceived(data: Buffer) {
    const ap = new AuthPacket(data.readUInt8(0), data.byteLength, false);
    ap.append(data);
    ap.offset = 0;

    log.info('<==', ap.toString());

    this.emit('packet:receive', ap);
    if (ap.opcodeName) {
      this.emit(`packet:receive:${ap.opcodeName}`, ap);
    }
  }

  // Logon challenge handler (LOGON_CHALLENGE)
  private handleLogonChallenge(packet: AuthPacket) {
    log.info('handleLogonChallenge');

    const result = DeserializeLogonChallenge(packet);
    if (result.success && result.result) {
      const srpParams = result.result;
      this.srp = new SRP(srpParams.N, srpParams.g);
      this.srp.feed(srpParams.salt, srpParams.B, this.account, this.password);
      this.socket.send(NewLogonProofPacket(this.srp));
    }
    else {
      this.emit('reject');
    }
  }

  // Logon proof handler (LOGON_PROOF)
  private handleLogonProof(ap: AuthPacket) {
    log.info('handleLogonProof');

    const code = ap.readUint8();
    ap.readUint8();

    log.info('received proof response');

    const M2 = readIntoByteArray(20, ap);

    if (this.srp && this.srp.validate(M2)) {
      this.emit('authenticate');
    } else {
      this.emit('reject');
    }
  }

}

export default AuthHandler;
