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
import { IObject } from 'interface/IObject';

export type MapFactory = (name: string) => Promise<Map>;

export const MapFactoryImpl = (context: interfaces.Context): MapFactory => {
  return async (name: string): Promise<Map> => {
    const position = new Property<IVector3>({x: 0, y: 0, z: 0});
    const adtAssetProvider = context.container.get<IAssetProvider<blizzardry.IADT>>('IAssetProvider<blizzardry.IADT>');
    const modelAssetProvider = context.container.get<IAssetProvider<ISceneObject>>('IAssetProvider<ISceneObject>');
    const wdtAssetProvider = context.container.get<IAssetProvider<WDT.IWDT>>('IAssetProvider<WDT.IWDT>');

    const chunks = await context.container.get<ChunksStateFactory>('ChunksStateFactory')(position.observable);
    const adtState =
      await context.container.get<AdtStateFactory>('AdtStateFactory')(name, chunks.chunks, adtAssetProvider);
    const doodadState =
      await context.container.get<DoodadStateFactory>('DoodadStateFactory')(adtState, modelAssetProvider);
    const wdtState =
      await context.container.get<WdtStateFactory>('WdtStateFactory')(name, wdtAssetProvider);
    return new Map(name, position, chunks, adtState, wdtState, doodadState);
  };
};

export class Map implements IObject {
  constructor(public name: string,
              public position: Property<IVector3>,
              public chunks: ChunksState,
              public adts: AdtState,
              public wdt: WdtState,
              public doodads: DoodadLoader) {}
  public async initialize(): Promise<void> {
    await this.chunks.initialize();
    await this.adts.initialize();
    await this.doodads.initialize();
    await this.wdt.initialize();
  }

  public dispose(): void {
    this.wdt.dispose();
    this.doodads.dispose();
    this.adts.dispose();
    this.chunks.dispose();
  }
}
