import SRP from '../crypto/SRP';
import { NewLogger } from '../utils/Logger';
import AuthOpcode from './Opcode';
import { IFactory } from '../../interface/Factory';
import { ISocket, SocketEvent } from '../../interface/Socket';
import { EventEmitter } from 'events';
import { LogonChallenge } from './packets/client/LogonChallenge';
import { SerializeObjectToBuffer } from '../net/Serialization';
import { Serializer, AuthHeaderSerializer } from '../net/Serializer';
import { Deserializer, AuthHeaderDeserializer } from '../net/Deserializer';
import { SLogonChallenge,
  NewLogonChallenge as NewSLogonChallenge } from './packets/server/LogonChallenge';
import { SLogonProof, NewLogonProof } from './packets/server/LogonProof';
import { LogonProof } from './packets/client/LogonProof';
import { RealmList as CRealmList } from './packets/client/RealmList';
import { RealmList as SRealmList, RealmListFactory as SRealmListFactory,
  RealmListFactory } from './packets/server/RealmList';
import { Config as AuthConfig } from './Config';
import { AuthSession } from './AuthSession';
import { IRealm } from '../../interface/Realm';
import { IPacket } from '../../interface/Packet';

const log = NewLogger('AuthHandler');

const sOpcodeMap = new Map<number, IFactory<IPacket>>([
  [AuthOpcode.LOGON_CHALLENGE, new NewSLogonChallenge()],
  [AuthOpcode.LOGON_PROOF, new NewLogonProof()],
  [AuthOpcode.REALM_LIST, new RealmListFactory()],
]);

class AuthHandler extends EventEmitter {
  private srp: SRP|null;
  private socket: ISocket;
  private serializer: Serializer;
  private deserializer: Deserializer;

  // Creates a new authentication handler
  constructor(socketFactory: IFactory<ISocket>) {
    super();

    this.socket = socketFactory.Create();
    this.serializer = new Serializer(AuthHeaderSerializer);
    this.deserializer = new Deserializer(AuthHeaderDeserializer, sOpcodeMap);
    this.serializer.OnPacketSerialized.sub((buffer) => this.socket.sendBuffer(buffer));

    // Holds Secure Remote Password implementation
    this.srp = null;

    // Listen for incoming data
    this.socket.OnDataReceived.sub((buffer) => this.deserializer.Deserialize(buffer));
  }

  // Retrieves the session key (if any)
  get key(): number[]|null {
    return this.srp && this.srp.K;
  }

  private async connectInternal(host: string, port: number) {
    return this.socket.connect2(host, port);
  }

  private async logonProof(srp: SRP) {
    return new Promise((resolve, reject) => {
      const logonProof = new LogonProof();
      logonProof.A = srp.A.toArray();
      if (srp.M1) {
        logonProof.M1 = srp.M1.digest;
      }
      logonProof.Crc = new Array(20);
      logonProof.NumberKeys = 0;
      logonProof.Flags = 0;
      this.serializer.Serialize(logonProof);

      this.deserializer.OnObjectDeserialized(AuthOpcode.LOGON_PROOF.toString())
        .one((scope: any, packet: SLogonProof) => {
          log.info('handleLogonProof');

          if (srp && srp.validate(packet.M2)) {
            resolve();
          }
          else {
            reject();
          }
        });
    });
  }

  private async challenge(config: AuthConfig): Promise<SRP> {
    return new Promise<SRP>((resolve, reject) => {
      log.info('authenticating ', config.Account);

      const challenge = new LogonChallenge();
      challenge.Unk1 = 0x08;
      challenge.Size = 30 + config.Account.length;
      challenge.Game = config.Game;
      challenge.Major = config.Major;
      challenge.Minor = config.Minor;
      challenge.Patch = config.Patch;
      challenge.Build = config.Build;
      challenge.Platform = config.Platform;
      challenge.Os = config.Os;
      challenge.Locale = config.Locale;
      challenge.Timezone = config.Timezone;
      challenge.IPAddress = config.IPAddress;
      challenge.AccountLength = config.Account.length;
      challenge.Account = config.Account;
      this.serializer.Serialize(challenge);

      this.deserializer.OnObjectDeserialized(AuthOpcode.LOGON_CHALLENGE.toString())
        .one((scope: any, packet: SLogonChallenge) => {
          log.info('handleLogonChallenge');

          const srp = new SRP(packet.N, packet.G);
          srp.feed(packet.Salt, packet.B, config.Account, config.Password);
          resolve(srp);
        });
    });
  }

  private async authenticate(config: AuthConfig) {
    const srp = await this.challenge(config);
    await this.logonProof(srp);
    this.srp = srp;
  }

  public async connect2(host: string, port: number, config: AuthConfig): Promise<AuthSession> {
    await this.connectInternal(host, port);
    await this.authenticate(config);
    return this;
  }

  public async GetRealms(): Promise<IRealm[]> {
    return new Promise<IRealm[]>((resolve, reject) => {
      const request = new CRealmList();
      this.serializer.Serialize(request);

      this.deserializer.OnObjectDeserialized(AuthOpcode.REALM_LIST.toString())
        .one((scope: any, packet: SRealmList) => {
          resolve(packet.Realms);
        });
    });
  }
}

export default AuthHandler;
