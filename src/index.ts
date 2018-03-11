import { Container } from 'inversify';

import { Client } from './Client';
import { IDeserializer } from './interface/IDeserializer';
import { IFactory } from './interface/IFactory';
import { IPacket } from './interface/IPacket';
import { IConfig } from './interface/IConfig';
import { ISerializer } from './interface/ISerializer';
import { ISession } from './interface/ISession';
import { AuthHandler } from './lib/auth/AuthHandler';
import AuthOpcode from './lib/auth/Opcode';
import { NewLogonChallenge } from './lib/auth/packets/server/LogonChallenge';
import { NewLogonProof } from './lib/auth/packets/server/LogonProof';
import { RealmListFactory } from './lib/auth/packets/server/RealmList';
import { GameHandler } from './lib/game/Handler';
import GameOpcode from './lib/game/Opcode';
import { NewSAuthChallenge } from './lib/game/packets/server/AuthChallenge';
import { NewSAuthResponse } from './lib/game/packets/server/AuthResponse';
import { NewServerPacket } from './lib/game/packets/server/ServerPacket';
import { NewSMsgCharEnum } from './lib/game/packets/server/SMsgCharEnum';
import { NewSMsgLoginVerifyWorld } from './lib/game/packets/server/SMsgLoginVerifyWorld';
import { NewSMsgSetProficiency } from './lib/game/packets/server/SMsgSetProficiency';
import { NewSMsgLogoutResponse } from './lib/game/packets/server/SMsgLogoutResponse';
import { NewSMsgSpellOGMiss } from './lib/game/packets/server/SMsgSpellOGMiss';
import { AuthHeaderDeserializer, Deserializer, GameHeaderDeserializer,
  IHeaderDeserializer } from './lib/net/Deserializer';
import { AuthHeaderSerializer, GameHeaderSerializer, IHeaderSerializer, Serializer } from './lib/net/Serializer';
import { Config } from './lib/auth/Config';

export async function InitializeCommon(container: Container) {
  container.bind<IConfig>('IConfig').to(Config);
  container.bind<IHeaderSerializer>('IHeaderSerializer').to(AuthHeaderSerializer).whenParentNamed('Auth');
  container.bind<IHeaderSerializer>('IHeaderSerializer').to(GameHeaderSerializer).whenParentNamed('Game');
  container.bind<ISerializer>('ISerializer').to(Serializer);

  container.bind<IHeaderDeserializer>('IHeaderDeserializer').to(AuthHeaderDeserializer).whenParentNamed('Auth');
  container.bind<IHeaderDeserializer>('IHeaderDeserializer').to(GameHeaderDeserializer).whenParentNamed('Game');
  container.bind<IDeserializer>('IDeserializer').to(Deserializer);

  container.bind<Map<number, IFactory<IPacket>>>('PacketMap').toConstantValue(
    new Map<number, IFactory<IPacket>>([
      [AuthOpcode.LOGON_CHALLENGE, new NewLogonChallenge()],
      [AuthOpcode.LOGON_PROOF, new NewLogonProof()],
      [AuthOpcode.REALM_LIST, new RealmListFactory()],
    ]),
  ).whenAnyAncestorNamed('Auth');

  container.bind<Map<number, IFactory<IPacket>>>('PacketMap').toConstantValue(
    new Map<number, IFactory<IPacket>>([
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
      [GameOpcode.SMSG_LOGOUT_RESPONSE, new NewSMsgLogoutResponse()],
    ]),
  ).whenAnyAncestorNamed('Game');

  container.bind<AuthHandler>(AuthHandler).toSelf();
  container.bind<GameHandler>(GameHandler).toSelf();
  container.bind<ISession>('ISession').to(Client);
}
