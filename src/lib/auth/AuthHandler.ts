import { inject, injectable, named } from 'inversify';

import { IConfig } from 'interface/IConfig';
import { IDeserializer } from 'interface/IDeserializer';
import { IRealm } from 'interface/IRealm';
import { ISerializer } from 'interface/ISerializer';
import { ISocket } from 'interface/ISocket';
import SRP from 'bawt/crypto/SRP';
import { NewLogger } from 'bawt/utils/Logger';
import { IAuthSession } from './AuthSession';
import AuthOpcode from './Opcode';
import { LogonChallenge } from './packets/client/LogonChallenge';
import { LogonProof } from './packets/client/LogonProof';
import { RealmList as CRealmList } from './packets/client/RealmList';
import { SLogonChallenge } from './packets/server/LogonChallenge';
import { SLogonProof } from './packets/server/LogonProof';
import { RealmList as SRealmList } from './packets/server/RealmList';

const log = NewLogger('AuthHandler');

@injectable()
export class AuthHandler {
  private srp: SRP|null;

  // Creates a new authentication handler
  constructor(@inject('ISocket') private socket: ISocket,
              @inject('ISerializer') @named('Auth') private serializer: ISerializer,
              @inject('IDeserializer') @named('Auth') private deserializer: IDeserializer,
              @inject('IConfig') private config: IConfig) {
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

  private async challenge(): Promise<SRP> {
    return new Promise<SRP>((resolve, reject) => {
      log.info('authenticating ', this.config.Account);

      const challenge = new LogonChallenge();
      challenge.Unk1 = 0x08;
      challenge.Size = 30 + this.config.Account.length;
      challenge.Game = this.config.Game;
      challenge.Major = this.config.Major;
      challenge.Minor = this.config.Minor;
      challenge.Patch = this.config.Patch;
      challenge.Build = this.config.Build;
      challenge.Platform = this.config.Platform;
      challenge.Os = this.config.Os;
      challenge.Locale = this.config.Locale;
      challenge.Timezone = this.config.Timezone;
      challenge.IPAddress = this.config.IPAddress;
      challenge.AccountLength = this.config.Account.length;
      challenge.Account = this.config.Account;
      this.serializer.Serialize(challenge);

      this.deserializer.OnObjectDeserialized(AuthOpcode.LOGON_CHALLENGE.toString())
        .one((scope: any, packet: SLogonChallenge) => {
          log.info('handleLogonChallenge');

          const srp = new SRP(packet.N, packet.G);
          srp.feed(packet.Salt, packet.B, this.config.Account, this.config.Password);
          resolve(srp);
        });
    });
  }

  private async authenticate() {
    const srp = await this.challenge();
    await this.logonProof(srp);
    this.srp = srp;
  }

  public async connect(host: string, port: number): Promise<IAuthSession> {
    await this.socket.connect(host, port);
    await this.authenticate();
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
