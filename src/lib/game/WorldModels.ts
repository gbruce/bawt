import { interfaces } from 'inversify';
import { NewLogger } from 'bawt/utils/Logger';
import { Vector3, Object3D, Group, Quaternion } from 'three';
import { IADTCollection, AdtState } from 'bawt/game/AdtState';
import { WMO } from 'bawt/assets/wmo';
import { terrainCoordToWorld } from 'bawt/utils/Functions';
import WMOGroup from 'bawt/assets/wmo/group/WMOGroup';
import { IAssetProvider } from 'interface/IAssetProvider';
import { IObject } from 'interface/IObject';
import { Subscription } from 'rxjs';

const log = NewLogger('game/WorldModels');

export type WorldModelFactory = ( adtState: AdtState,
                                  wmoAssetProvider: IAssetProvider<blizzardry.IWMO>,
                                  wmoGroupAssetProvider: IAssetProvider<blizzardry.IWMOGroup>) => Promise<WorldModels>;

export const WorldModelFactoryImpl = (context: interfaces.Context): WorldModelFactory => {
  return async (adtState: AdtState, wmoAssetProvider: IAssetProvider<blizzardry.IWMO>,
                wmoGroupAssetProvider: IAssetProvider<blizzardry.IWMOGroup>): Promise<WorldModels> => {
    return new WorldModels(adtState, wmoAssetProvider, wmoGroupAssetProvider);
  };
};

export class WorldModels implements IObject {
  public root: Object3D = new Object3D();
  private sub: Subscription|null = null;

  constructor(private adtState: AdtState, private wmoAssetProvider: IAssetProvider<blizzardry.IWMO>,
              private wmoGroupAssetProvider: IAssetProvider<blizzardry.IWMOGroup>) {}

  public async initialize(): Promise<void> {
    this.sub = this.adtState.adt.subscribe({ next: this.onAdtChanged });
  }

  public dispose(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
    }
  }

  private onAdtChanged = async (collection: IADTCollection) => {
    for (const info of collection.added) {
      const chunkRoot: Object3D = new Object3D();
      chunkRoot.name = info.chunkId.toString();

      const wmoEntries = info.adt.MCNKs[info.mcnkIndex].MCRF.wmoEntries;
      for (const wmoEntry of wmoEntries) {
        log.info(`Loading wmo filename:${wmoEntry.filename}`);

        const wmo = await this.wmoAssetProvider.start(wmoEntry.filename);
        if (!wmo) {
          continue;
        }

        let wmoSceneRoot = chunkRoot.getObjectByName(wmo.filename);
        if (!wmoSceneRoot) {
          wmoSceneRoot = new Group();
          wmoSceneRoot.name = wmo.filename;

          const position: number[] = [wmoEntry.position.x, wmoEntry.position.y, wmoEntry.position.z];
          const rotation: number[] = [wmoEntry.rotation.x, 270 - wmoEntry.rotation.y, wmoEntry.rotation.z];
          const m = terrainCoordToWorld(position, rotation);
          const resultPos = new Vector3();
          const resultRot = new Quaternion();
          m.decompose(resultPos, resultRot, new Vector3());

          wmoSceneRoot.setRotationFromQuaternion(resultRot);
          wmoSceneRoot.position.copy(resultPos);
          wmoSceneRoot.updateMatrix();
          wmoSceneRoot.matrixAutoUpdate = false;

          log.info(`Place WMO:${wmoEntry.filename} pos: ${JSON.stringify(resultPos)} rot:${JSON.stringify(resultRot)}`);

          chunkRoot.add(wmoSceneRoot);
        }

        const zeroPad = (num: number, places: number) => {
          const zero = places - num.toString().length + 1;
          return Array(+(zero > 0 && zero)).join('0') + num;
        };

        const wmoBase = wmo.filename.substr(0, wmo.filename.length - 4);
        const wmoRoot = new WMO(wmo);
        for (let i = 0; i < wmo.MOHD.groupCount; i++) {
          const group = wmo.MOGI.groups[i];
          const wmoGroupFile = `${wmoBase}_${zeroPad(i, 3)}.wmo`;
          const wmoGroup = await this.wmoGroupAssetProvider.start(wmoGroupFile);

          if (wmoGroup) {
            const grp = new WMOGroup(wmo, '', wmoGroup);
            grp.name = wmoGroup.filename;
            await grp.initialize();
            grp.matrixAutoUpdate = false;
            wmoSceneRoot.add(grp);
          }
        }
      }

      // for (const chunkId of collection.deleted) {
      //   const chunkRt = this.root.getObjectByName(chunkId.toString());
      //   for (let i = chunkRt.children.length - 1; i >= 0; i--) {
      //     const model: M2Model = chunkRt.children[i] as M2Model;
      //     log.info(`Unloading doodad filename:${model.name}`);
      //     model.dispose();
      //     this.root.remove(model);
      //   }
      //   this.root.remove(chunkRt);
      // }
      log.debug(`chunks:${this.root.children.length}`);
      this.root.add(chunkRoot);
    }
  }
}
