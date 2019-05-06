import { IVector3 } from 'interface/IVector3';
import { ChunksState, ChunksStateFactory } from './ChunksState';
import { AdtState, AdtStateFactory } from './AdtState';
import { DoodadLoader, DoodadStateFactory } from './DoodadLoader';
import { interfaces } from 'inversify';
import { Property } from 'bawt/utils/Property';
import { IAssetProvider } from 'interface/IAssetProvider';
import { ISceneObject } from 'interface/ISceneObject';

export interface IMap {
  position: Property<IVector3>;
  name: string;
  chunks: ChunksState;
  adts: AdtState;
  doodads: DoodadLoader;
}

export type MapFactory = (name: string) => Promise<IMap>;

export const MapFactoryImpl = (context: interfaces.Context): MapFactory => {
  return async (name: string): Promise<IMap> => {
    const position = new Property<IVector3>({x: 0, y: 0, z: 0});
    const chunks = await context.container.get<ChunksStateFactory>('ChunksStateProvider')(position.observable);
    await chunks.initialize();

    const adtAssetProvider = context.container.get<IAssetProvider<blizzardry.IADT>>('IAssetProvider<blizzardry.IADT>');
    const modelAssetProvider = context.container.get<IAssetProvider<ISceneObject>>('IAssetProvider<ISceneObject>');

    const adtState =
      await context.container.get<AdtStateFactory>('AdtStateProvider')(name, chunks.chunks, adtAssetProvider);
    const doodadState =
      await context.container.get<DoodadStateFactory>('DoodadStateProvider')(adtState, modelAssetProvider);

    const map = new Map(name, position, chunks, adtState, doodadState);
    return map;
  };
};

export class Map implements IMap {
  constructor(public name: string,
              public position: Property<IVector3>,
              public chunks: ChunksState,
              public adts: AdtState,
              public doodads: DoodadLoader) {}
}
