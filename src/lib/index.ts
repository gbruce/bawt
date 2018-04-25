import { Container } from 'inversify';

import { Client } from './Client';
import { IDeserializer } from 'interface/IDeserializer';
import { IFactory } from 'interface/IFactory';
import { IPacket } from 'interface/IPacket';
import { IConfig } from 'interface/IConfig';
import { ISerializer } from 'interface/ISerializer';
import { ISession } from 'interface/ISession';
import { AuthHandler } from 'bawt/auth/AuthHandler';
import AuthOpcode from 'bawt/auth/Opcode';
import { NewLogonChallenge } from 'bawt/auth/packets/server/LogonChallenge';
import { NewLogonProof } from 'bawt/auth/packets/server/LogonProof';
import { RealmListFactory } from 'bawt/auth/packets/server/RealmList';
import { GameHandler } from 'bawt/game/Handler';
import GameOpcode from 'bawt/game/Opcode';
import { NewSAuthChallenge } from 'bawt/game/packets/server/AuthChallenge';
import { NewSAuthResponse } from 'bawt/game/packets/server/AuthResponse';
import { NewServerPacket } from 'bawt/game/packets/server/ServerPacket';
import { NewSMsgCharEnum } from 'bawt/game/packets/server/SMsgCharEnum';
import { NewSMsgLoginVerifyWorld } from 'bawt/game/packets/server/SMsgLoginVerifyWorld';
import { NewSMsgSetProficiency } from 'bawt/game/packets/server/SMsgSetProficiency';
import { NewSMsgLogoutResponse } from 'bawt/game/packets/server/SMsgLogoutResponse';
import { NewSMsgSpellOGMiss } from 'bawt/game/packets/server/SMsgSpellOGMiss';
import { AuthHeaderDeserializer, Deserializer, GameHeaderDeserializer,
  IHeaderDeserializer } from 'bawt/net/Deserializer';
import { AuthHeaderSerializer, GameHeaderSerializer, IHeaderSerializer, Serializer } from 'bawt/net/Serializer';
import { Config } from 'bawt/auth/Config';
import { Names } from 'bawt/utils/Names';

export async function InitializeCommon(container: Container) {
  container.bind<Names>(Names).toSelf().inSingletonScope();
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

  container.bind<AuthHandler>(AuthHandler).toSelf().inSingletonScope();
  container.bind<GameHandler>(GameHandler).toSelf().inSingletonScope();
  container.bind<ISession>('ISession').to(Client);
}
