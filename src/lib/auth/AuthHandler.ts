import AuthChallengeOpcode from './ChallengeOpcode';
import AuthOpcode from './Opcode';
import AuthPacket from './packet';
import Socket from '../net/socket';
import SRP from '../crypto/srp';
import { Session } from '../../interface/Session';

const ReadIntoByteArray = function(bytes: number, bb: ByteBuffer) {
  const result = [];
  for(let i=0; i<bytes; i++) {
    result.push(bb.readUint8());
  }
  return result;
};

class AuthHandler extends Socket {
  private session: Session;
  private account: any;
  private password: string|null;
  private srp: SRP;

  // Default port for the auth-server
  static PORT = 3724;

  // Creates a new authentication handler
  constructor(session: Session) {
    super();

    // Holds session
    this.session = session;

    // Holds credentials for this session (if any)
    this.account = null;
    this.password = null;

    // Holds Secure Remote Password implementation
    this.srp;

    // Listen for incoming data
    this.on('data:receive', this.dataReceived);

    // Delegate packets
    this.on('packet:receive:LOGON_CHALLENGE', this.handleLogonChallenge);
    this.on('packet:receive:LOGON_PROOF', this.handleLogonProof);
  }

  // Retrieves the session key (if any)
  get key() {
    return this.srp && this.srp.K;
  }

  // Connects to given host through given port
  connect(host: string, port: number = NaN) {
    if (!this.connected) {
      super.connect(host, port || AuthHandler.PORT);
      console.info('connecting to auth-server @', this.host, ':', this.port);
    }
    return this;
  }

  // Sends authentication request to connected host
  authenticate(account: any, password: string) {
    if (!this.connected) {
      return false;
    }

    this.account = account.toUpperCase();
    this.password = password.toUpperCase();

    console.info('authenticating ', this.account);

    // Extract configuration data
    const {
      build,
      majorVersion,
      minorVersion,
      patchVersion,
      game,
      raw: {
        os, locale, platform
      },
      timezone
    } = this.session.config;

    const ap = new AuthPacket(AuthOpcode.LOGON_CHALLENGE, 4 + 29 + 1 + this.account.length);
    ap.writeUint8(AuthOpcode.LOGON_CHALLENGE);
    ap.writeUint8(0x00);
    ap.writeUint16(30 + this.account.length);
    ap.WriteString(game);         // game string
    ap.writeUint8(majorVersion);    // v1 (major)
    ap.writeUint8(minorVersion);    // v2 (minor)
    ap.writeUint8(patchVersion);    // v3 (patch)
    ap.writeUint16(build);          // build
    ap.WriteString(platform);      // platform
    ap.WriteString(os);            // os
    ap.WriteString(locale);        // locale
    ap.writeUint32(timezone); // timezone
    ap.writeUint8(127);
    ap.writeUint8(0);
    ap.writeUint8(0);
    ap.writeUint8(1);
    ap.writeByte(this.account.length); // account length
    ap.WriteString(this.account);      // account

    this.send(ap);
  }

  // Data received handler
  dataReceived(data: Buffer) {
    if (!this.connected) {
      return;
    }

    const ap = new AuthPacket(data.readUInt8(0), data.byteLength, false);
    ap.append(data);
    ap.offset = 0;

    console.log('<==', ap.toString());

    this.emit('packet:receive', ap);
    if (ap.opcodeName) {
      this.emit(`packet:receive:${ap.opcodeName}`, ap);
    }
  }

  // Logon challenge handler (LOGON_CHALLENGE)
  handleLogonChallenge(ap: AuthPacket) {
    console.log('handleLogonChallenge');

    const code = ap.readUint8();
    ap.readUint8();
    const status = ap.readUint8();

    switch (status) {
      case AuthChallengeOpcode.SUCCESS:
        console.info('received logon challenge');

        const B = ReadIntoByteArray(32, ap);
        const glen = ap.readUint8(); // g-length
        const g = ReadIntoByteArray(glen, ap);
        const Nlen = ap.readUint8(); // n-length
        const N = ReadIntoByteArray(Nlen, ap);
        const salt = ReadIntoByteArray(32, ap);

        this.srp = new SRP(N, g);
        this.srp.feed(salt, B, this.account, this.password);

        const lpp = new AuthPacket(AuthOpcode.LOGON_PROOF, 1 + 32 + 20 + 20 + 2);
        lpp.writeUint8(AuthOpcode.LOGON_PROOF);
        lpp.append(this.srp.A.toArray());
        if(this.srp.M1) {
          lpp.append(this.srp.M1.digest);
        }
        lpp.append(new Uint8Array(20)); // CRC hash
        lpp.writeByte(0x00);      // number of keys
        lpp.writeByte(0x00);      // security flags

        this.send(lpp);
        break;
      case AuthChallengeOpcode.ACCOUNT_INVALID:
        console.warn('account invalid');
        this.emit('reject');
        break;
      case AuthChallengeOpcode.BUILD_INVALID:
        console.warn('build invalid');
        this.emit('reject');
        break;
      default:
        break;
    }
  }

  // Logon proof handler (LOGON_PROOF)
  handleLogonProof(ap: AuthPacket) {
    console.log('handleLogonProof');

    const code = ap.readUint8();
    ap.readUint8();

    console.info('received proof response');

    const M2 = ReadIntoByteArray(20, ap);

    if (this.srp.validate(M2)) {
      this.emit('authenticate');
    } else {
      this.emit('reject');
    }
  }

}

export default AuthHandler;
