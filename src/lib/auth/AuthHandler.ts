import SRP from '../crypto/SRP';
import { NewLogger } from '../utils/Logger';
import AuthOpcode from './Opcode';
import { Factory } from '../../interface/Factory';
import { Socket, SocketEvent } from '../../interface/Socket';
import { EventEmitter } from 'events';
import { LogonChallenge } from './packets/client/LogonChallenge';
import { Serializable, SerializeObjectToBuffer } from '../net/Serialization';
import { Serializer } from '../net/Serializer';
import { Deserializer } from '../net/Deserializer';
import { SLogonChallenge,
  NewLogonChallenge as NewSLogonChallenge } from './packets/server/LogonChallenge';
import { SLogonProof,
  NewLogonProof as NewSLogonProof } from './packets/server/LogonProof';
import { LogonProof, NewLogonProof } from './packets/client/LogonProof';
import { RealmList as CRealmList } from './packets/client/RealmList';
import { RealmList as SRealmList, RealmListFactory as SRealmListFactory,
  RealmListFactory } from './packets/server/RealmList';
import { Config as AuthConfig } from './Config';

const log = NewLogger('AuthHandler');

function ToHexString(byteArray: any) {
  return Array.from(byteArray, (byte: any) => {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join(':');
}

const sOpcodeMap = new Map<number, Factory<Serializable>>([
  [AuthOpcode.LOGON_CHALLENGE, new NewSLogonChallenge()],
  [AuthOpcode.LOGON_PROOF, new NewSLogonProof()],
  [AuthOpcode.REALM_LIST, new RealmListFactory()],
]);

class AuthHandler extends EventEmitter {
  // Default port for the auth-server
  public static PORT = 3724;

  public account: string;
  private password: string|null;
  private srp: SRP|null;
  private socket: Socket;
  private serializer: Serializer;
  private deserializer: Deserializer;

  // Creates a new authentication handler
  constructor(socketFactory: Factory<Socket>) {
    super();

    this.socket = socketFactory.Create();
    this.serializer = new Serializer();
    this.deserializer = new Deserializer(sOpcodeMap);
    this.serializer.OnPacketSerialized.sub((buffer) => this.socket.sendBuffer(buffer));
    this.deserializer.OnObjectDeserialized(AuthOpcode.LOGON_CHALLENGE.toString())
      .sub((scope: any, obj: any) => this.handleLogonChallenge(obj));
    this.deserializer.OnObjectDeserialized(AuthOpcode.LOGON_PROOF.toString())
      .sub((scope: any, obj: any) => this.handleLogonProof(obj));
    this.deserializer.OnObjectDeserialized(AuthOpcode.REALM_LIST.toString())
      .sub((scope: any, obj: any) => this.handleRealmList(obj));

    // Holds credentials for this session (if any)
    this.password = null;

    // Holds Secure Remote Password implementation
    this.srp = null;

    // Listen for incoming data
    this.socket.on(SocketEvent.OnDataReceived, (args: any[]) => this.deserializer.Deserialize(args[0]));
    this.socket.on(SocketEvent.OnConnected, () => this.emit('connect'));
  }

  // Retrieves the session key (if any)
  get key(): number[]|null {
    return this.srp && this.srp.K;
  }

  // Connects to given host through given port
  public connect(host: string, port: number = NaN) {
    this.socket.connect(host, port || AuthHandler.PORT);
    log.info('connecting to auth-server @', host, ':', port);
    return this;
  }

  // Sends authentication request to connected host
  public authenticate(config: AuthConfig) {
    this.account = config.Account;
    this.password = config.Password;

    log.info('authenticating ', this.account);

    const packet = new LogonChallenge();
    packet.Unk1 = 0x08;
    packet.Size = 30 + config.Account.length;
    packet.Game = config.Game;
    packet.Major = config.Major;
    packet.Minor = config.Minor;
    packet.Patch = config.Patch;
    packet.Build = config.Build;
    packet.Platform = config.Platform;
    packet.Os = config.Os;
    packet.Locale = config.Locale;
    packet.Timezone = config.Timezone;
    packet.IPAddress = config.IPAddress;
    packet.AccountLength = config.Account.length;
    packet.Account = config.Account;
    this.serializer.Serialize(packet);
  }

  public requestRealmList() {
    const packet = new CRealmList();
    this.serializer.Serialize(packet);
  }

  private handleLogonChallenge(packet: SLogonChallenge) {
    log.info('handleLogonChallenge');

    this.srp = new SRP(packet.N, packet.G);
    this.srp.feed(packet.Salt, packet.B, this.account, this.password);

    const logonProof = new LogonProof();
    logonProof.A = this.srp.A.toArray();
    if (this.srp.M1) {
      logonProof.M1 = this.srp.M1.digest;
    }
    logonProof.Crc = new Array(20);
    logonProof.NumberKeys = 0;
    logonProof.Flags = 0;
    this.serializer.Serialize(logonProof);
  }

  private handleLogonProof(packet: SLogonProof) {
    log.info('handleLogonProof');

    if (this.srp && this.srp.validate(packet.M2)) {
      this.emit('authenticate');
    }
    else {
      this.emit('reject');
    }
  }

  private handleRealmList(packet: SRealmList) {
    log.info('handleRealmList');

    this.emit('realmList', packet);
  }
}

export default AuthHandler;
