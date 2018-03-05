
import { Client } from './Client';
import { Socket } from './lib/net/Socket';
import { ISocket } from './interface/ISocket';
import { ISession } from './interface/ISession';
import { ISerializer } from './interface/ISerializer';
import { IDeserializer } from './interface/IDeserializer';
import { IPacket } from './interface/IPacket';
import { IFactory } from './interface/IFactory';
import { AuthHandler } from './lib/auth/AuthHandler';
import { GameHandler } from './lib/game/Handler';
import { IHeaderSerializer, Serializer, AuthHeaderSerializer, GameHeaderSerializer } from './lib/net/Serializer';
import { IHeaderDeserializer, Deserializer, AuthHeaderDeserializer, GameHeaderDeserializer } from './lib/net/Deserializer';
import { Container, injectable, inject, interfaces } from "inversify";
import { NewLogonChallenge }  from './lib/auth/packets/server/LogonChallenge';
import { NewLogonProof }  from './lib/auth/packets/server/LogonProof';
import { RealmListFactory }  from './lib/auth/packets/server/RealmList';
import { NewSAuthChallenge } from './lib/game/packets/server/AuthChallenge';
import { NewSAuthResponse } from './lib/game/packets/server/AuthResponse';
import { NewSMsgLoginVerifyWorld } from './lib/game/packets/server/SMsgLoginVerifyWorld';
import { NewSMsgSetProficiency } from './lib/game/packets/server/SMsgSetProficiency';
import { NewSMsgSpellOGMiss } from './lib/game/packets/server/SMsgSpellOGMiss';
import { NewSMsgCharEnum } from './lib/game/packets/server/SMsgCharEnum';
import { NewServerPacket } from './lib/game/packets/server/ServerPacket';
import { default as AuthOpcode } from './lib/auth/Opcode';
import { default as GameOpcode } from './lib/game/Opcode';
import * as data from './lightshope.json';
import { SetVersion, Version, GetVersion } from './lib/utils/Version';
import { makeLoggerMiddleware } from 'inversify-logger-middleware';

const container = new Container();
const logger = makeLoggerMiddleware();
container.applyMiddleware(logger);

container.bind<ISocket>("ISocket").to(Socket);
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
  ])
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
  ])
).whenAnyAncestorNamed('Game');

container.bind<AuthHandler>(AuthHandler).toSelf();
container.bind<GameHandler>(GameHandler).toSelf();
container.bind<ISession>('ISession').to(Client);

SetVersion((data as any).version);
const session = container.get<ISession>('ISession');
session.Start();
