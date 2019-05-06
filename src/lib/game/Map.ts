import { IVector3 } from 'interface/IVector3';
import { ChunksState, ChunksStateFactory } from './ChunksState';
import { AdtState, AdtStateFactory } from './AdtState';
import { DoodadLoader, DoodadStateFactory } from './DoodadLoader';
import { interfaces } from 'inversify';
import { Property } from 'bawt/utils/Property';
import { IAssetProvider } from 'interface/IAssetProvider';
import { ISceneObject } from 'interface/ISceneObject';
import { WdtState, WdtStateFactory } from './WdtState';
import * as WDT from 'blizzardry/lib/wdt';

export interface IMap {
  position: Property<IVector3>;
  name: string;
  chunks: ChunksState;
  adts: AdtState;
  doodads: DoodadLoader;
  wdt: WdtState;
}

export type MapFactory = (name: string) => Promise<IMap>;

export const MapFactoryImpl = (context: interfaces.Context): MapFactory => {
  return async (name: string): Promise<IMap> => {
    const position = new Property<IVector3>({x: 0, y: 0, z: 0});
    const chunks = await context.container.get<ChunksStateFactory>('ChunksStateFactory')(position.observable);
    await chunks.initialize();

    const adtAssetProvider = context.container.get<IAssetProvider<blizzardry.IADT>>('IAssetProvider<blizzardry.IADT>');
    const modelAssetProvider = context.container.get<IAssetProvider<ISceneObject>>('IAssetProvider<ISceneObject>');
    const wdtAssetProvider = context.container.get<IAssetProvider<WDT.IWDT>>('IAssetProvider<WDT.IWDT>');

    const adtState =
      await context.container.get<AdtStateFactory>('AdtStateFactory')(name, chunks.chunks, adtAssetProvider);
    const doodadState =
      await context.container.get<DoodadStateFactory>('DoodadStateFactory')(adtState, modelAssetProvider);
    const wdtState =
      await context.container.get<WdtStateFactory>('WdtStateFactory')(name, wdtAssetProvider);

    const map = new Map(name, position, chunks, adtState, wdtState, doodadState);
    return map;
  };
};

export class Map implements IMap {
  constructor(public name: string,
              public position: Property<IVector3>,
              public chunks: ChunksState,
              public adts: AdtState,
              public wdt: WdtState,
              public doodads: DoodadLoader) {}
}
