import { inject, injectable, named } from 'inversify';

import { IConfig } from '../../interface/iConfig';
import { IDeserializer } from '../../interface/IDeserializer';
import { IRealm } from '../../interface/IRealm';
import { ISerializer } from '../../interface/ISerializer';
import { ISocket } from '../../interface/ISocket';
import SRP from '../crypto/SRP';
import { NewLogger } from '../utils/Logger';
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
  constructor(@inject("ISocket") private socket: ISocket,
              @inject("ISerializer") @named('Auth') private serializer: ISerializer,
              @inject("IDeserializer") @named('Auth') private deserializer: IDeserializer) {
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

  private async challenge(config: IConfig): Promise<SRP> {
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

  private async authenticate(config: IConfig) {
    const srp = await this.challenge(config);
    await this.logonProof(srp);
    this.srp = srp;
  }

  public async connect(host: string, port: number, config: IConfig): Promise<IAuthSession> {
    await this.socket.connect(host, port);
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
