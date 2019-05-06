import { Container } from 'inversify';

import { Client } from './Client';
import { IDeserializer } from 'interface/IDeserializer';
import { IConfig } from 'interface/IConfig';
import { ISerializer } from 'interface/ISerializer';
import { ISession } from 'interface/ISession';
import { AuthHandler } from 'bawt/auth/AuthHandler';
import { PacketMap} from 'bawt/net/PacketMap';
import { SLogonChallenge } from 'bawt/auth/packets/server/LogonChallenge';
import { SLogonProof } from 'bawt/auth/packets/server/LogonProof';
import { RealmList } from 'bawt/auth/packets/server/RealmList';
import { GameHandler } from 'bawt/game/Handler';
import { SAuthChallenge } from 'bawt/game/packets/server/AuthChallenge';
import { SAuthResponse } from 'bawt/game/packets/server/AuthResponse';
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
import { ChunksState, ChunksStateFactory, ChunksStateFactoryImpl } from 'bawt/game/ChunksState';
import { WdtState, WdtStateFactory, WdtStateFactoryImpl } from 'bawt/game/WdtState';
import { Observable } from 'rxjs';
import * as WDT from 'blizzardry/lib/wdt';
import { AdtState, AdtStateFactory, AdtStateFactoryImpl } from 'bawt/game/AdtState';
import { IAssetProvider } from 'interface/IAssetProvider';
import { LoadADT } from './worker/LoadADT';
import { LoadModel } from './worker/LoadModel';
import { ISceneObject } from 'interface/ISceneObject';
import { DoodadLoader, DoodadStateFactory, DoodadStateFactoryImpl } from 'bawt/game/DoodadLoader';
import { DoodadVisibility, DoodadVisibilityFactory, DoodadVisibilityFactoryImpl } from 'bawt/game/DoodadVisibility';
import { LoadM2 } from 'bawt/worker/LoadM2';
import { LoadSkin } from 'bawt/worker/LoadSkin';
import { IMap, MapFactory, MapFactoryImpl } from './game/Map';
import { LoadWDT } from './worker/LoadWDT';
import { LoadWMO } from './worker/LoadWMO';
import { LoadWMOGroup } from './worker/LoadWMOGroup';
import { TerrainFactory, TerrainFactoryImpl, Terrain } from './game/Terrain';

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

  container.bind<Observable<WDT.IWDT|null>>('Observable<WDT.IWDT|null>').toDynamicValue((context) => {
    return context.container.get<WdtState>('WdtState').wdtSubject;
  });

  container.bind<DoodadVisibility>('DoodadVisibility').to(DoodadVisibility).inSingletonScope();

  // Asset Providers
  container.bind<IAssetProvider<blizzardry.IADT>>('IAssetProvider<blizzardry.IADT>')
    .to(LoadADT).inSingletonScope();
  container.bind<IAssetProvider<ISceneObject>>('IAssetProvider<ISceneObject>')
  .to(LoadModel).inSingletonScope();
  container.bind<IAssetProvider<blizzardry.IModel>>('IAssetProvider<blizzardry.IModel>')
    .to(LoadM2).inSingletonScope();
  container.bind<IAssetProvider<blizzardry.ISkin>>('IAssetProvider<blizzardry.ISkin>')
    .to(LoadSkin).inSingletonScope();
  container.bind<IAssetProvider<WDT.IWDT>>('IAssetProvider<WDT.IWDT>')
    .to(LoadWDT).inSingletonScope();
  container.bind<IAssetProvider<blizzardry.IWMO>>('IAssetProvider<blizzardry.IWMO>')
    .to(LoadWMO).inSingletonScope();
  container.bind<IAssetProvider<blizzardry.IWMOGroup>>('IAssetProvider<blizzardry.IWMOGroup>')
    .to(LoadWMOGroup).inSingletonScope();

  container.bind<DoodadVisibilityFactory>('DoodadVisibilityFactory')
    .toFactory<DoodadVisibility>(DoodadVisibilityFactoryImpl);
  container.bind<TerrainFactory>('TerrainFactory').toFactory<Terrain>(TerrainFactoryImpl);

  container.bind<ChunksStateFactory>('ChunksStateProvider').toProvider<ChunksState>(ChunksStateFactoryImpl);
  container.bind<MapFactory>('MapProvider').toProvider<IMap>(MapFactoryImpl);
  container.bind<AdtStateFactory>('AdtStateProvider').toProvider<AdtState>(AdtStateFactoryImpl);
  container.bind<DoodadStateFactory>('DoodadStateProvider').toProvider<DoodadLoader>(DoodadStateFactoryImpl);
  container.bind<WdtStateFactory>('WdtStateProvider').toProvider<WdtState>(WdtStateFactoryImpl);
}
