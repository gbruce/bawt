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
import { PacketMap} from 'bawt/net/PacketMap';
import { SLogonChallenge } from 'bawt/auth/packets/server/LogonChallenge';
import { SLogonProof } from 'bawt/auth/packets/server/LogonProof';
import { RealmList } from 'bawt/auth/packets/server/RealmList';
import { GameHandler } from 'bawt/game/Handler';
import GameOpcode from 'bawt/game/Opcode';
import { SAuthChallenge } from 'bawt/game/packets/server/AuthChallenge';
import { SAuthResponse } from 'bawt/game/packets/server/AuthResponse';
import { NewServerPacket } from 'bawt/game/packets/server/ServerPacket';
import { SMsgCharEnum } from 'bawt/game/packets/server/SMsgCharEnum';
import { SMsgLoginVerifyWorld } from 'bawt/game/packets/server/SMsgLoginVerifyWorld';
import { SMsgSetProficiency } from 'bawt/game/packets/server/SMsgSetProficiency';
import { SMsgLogoutResponse } from 'bawt/game/packets/server/SMsgLogoutResponse';
import { SMsgSpellOGMiss } from 'bawt/game/packets/server/SMsgSpellOGMiss';
import { AuthHeaderDeserializer, Deserializer, GameHeaderDeserializer,
  IHeaderDeserializer } from 'bawt/net/Deserializer';
import { AuthHeaderSerializer, GameHeaderSerializer, IHeaderSerializer, Serializer } from 'bawt/net/Serializer';
import { Config } from 'bawt/auth/Config';
import { Names } from 'bawt/utils/Names';
import { Step, IStep } from 'bawt/utils/Step';
import { AuthPacketMap, WorldPacketMap } from 'bawt/net/PacketMap';
import { PlayerState, ILocation } from 'bawt/game/PlayerState';
import { ChunksState, IChunkCollection } from 'bawt/game/ChunksState';
import { WdtState } from 'bawt/game/WdtState';
import { Observable } from 'rxjs';
import * as WDT from 'blizzardry/lib/wdt';
import { AdtState, IADTCollection } from 'bawt/game/AdtState';
import { Doodads } from 'bawt/game/Doodads';

// We need to directly reference the classes to trigger their decorators.
SLogonChallenge.Referenced = true;
SLogonProof.Referenced = true;
RealmList.Referenced = true;
SAuthChallenge.Referenced = true;
SAuthResponse.Referenced = true;
SMsgCharEnum.Referenced = true;
SMsgLoginVerifyWorld.Referenced = true;
SMsgSetProficiency.Referenced = true;
SMsgLogoutResponse.Referenced = true;
SMsgSpellOGMiss.Referenced = true;

export async function InitializeCommon(container: Container) {
  container.bind<Names>(Names).toSelf().inSingletonScope();
  container.bind<IConfig>('IConfig').to(Config);
  container.bind<IHeaderSerializer>('IHeaderSerializer').to(AuthHeaderSerializer).whenParentNamed('Auth');
  container.bind<IHeaderSerializer>('IHeaderSerializer').to(GameHeaderSerializer).whenParentNamed('Game');
  container.bind<ISerializer>('ISerializer').to(Serializer);

  container.bind<IHeaderDeserializer>('IHeaderDeserializer').to(AuthHeaderDeserializer).whenParentNamed('Auth');
  container.bind<IHeaderDeserializer>('IHeaderDeserializer').to(GameHeaderDeserializer).whenParentNamed('Game');
  container.bind<IDeserializer>('IDeserializer').to(Deserializer);

  container.bind<PacketMap>('PacketMap').toConstantValue(AuthPacketMap).whenAnyAncestorNamed('Auth');
  container.bind<PacketMap>('PacketMap').toConstantValue(WorldPacketMap).whenAnyAncestorNamed('Game');

  container.bind<AuthHandler>(AuthHandler).toSelf().inSingletonScope();
  container.bind<GameHandler>(GameHandler).toSelf().inSingletonScope();
  container.bind<ISession>('ISession').to(Client);

  container.bind<Step>('Step').to(Step).inSingletonScope();
  container.bind<Observable<IStep>>('Observable<IStep>').toDynamicValue((context) => {
    return context.container.get<Step>('Step').step.observable;
  });

  container.bind<PlayerState>('PlayerState').to(PlayerState).inSingletonScope();
  container.bind<Observable<ILocation>>('Observable<ILocation>').toDynamicValue((context) => {
    return context.container.get<PlayerState>('PlayerState').location.observable;
  });
  container.bind<Observable<WDT.IWDT|null>>('Observable<WDT.IWDT|null>').toDynamicValue((context) => {
    return context.container.get<WdtState>('WdtState').wdtSubject;
  });

  container.bind<WdtState>('WdtState').to(WdtState).inSingletonScope();
  await container.get<WdtState>('WdtState').initialize();

  container.bind<ChunksState>('ChunksState').to(ChunksState).inSingletonScope();
  container.bind<Observable<IChunkCollection>>('Observable<IChunkCollection>').toDynamicValue((context) => {
    return context.container.get<ChunksState>('ChunksState').chunks;
  });
  await container.get<ChunksState>('ChunksState').initialize();

  container.bind<AdtState>(AdtState).toSelf().inSingletonScope();
  container.bind<Observable<IADTCollection>>('Observable<IADTCollection>').toDynamicValue((context) => {
    return context.container.get<AdtState>(AdtState).adt;
  });

  container.bind<Doodads>('Doodads').to(Doodads).inSingletonScope();
}
