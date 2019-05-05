import { injectable, interfaces } from 'inversify';
import { IADTCollection, AdtState } from 'bawt/game/AdtState';
import { BehaviorSubject } from 'rxjs';
import { NewLogger } from 'bawt/utils/Logger';
import { Vector3 } from 'three';
import { ISceneObject } from 'interface/ISceneObject';
import { IAssetProvider } from 'interface/IAssetProvider';

const log = NewLogger('game/DoodadLoader');

export interface IDoodadInfo {
  id: number;
  model: ISceneObject;
}

export interface IDoodadCollection {
  added: IDoodadInfo[];
  deleted: number[]; // id
  current: IDoodadInfo[];
}

class DoodadItem {
  public count: number = 0;
  public model: ISceneObject|null = null;

  constructor(  public doodad: blizzardry.IDoodad,
                public chunkId: number,
                public canceled: boolean = false) {}
}

export type DoodadStateFactory =
  (adtState: AdtState, modelAssetProvider: IAssetProvider<ISceneObject>) => Promise<DoodadLoader>;

export const DoodadStateFactoryImpl = (context: interfaces.Context): DoodadStateFactory => {
  return async (adtState: AdtState, modelAssetProvider: IAssetProvider<ISceneObject>):
    Promise<DoodadLoader> => {
    return new DoodadLoader(adtState, modelAssetProvider);
  };
};

@injectable()
export class DoodadLoader {
  private doodads: Map<number, DoodadItem> = new Map();
  private chunkMap: Map<number, DoodadItem[]> = new Map();

  public doodadSubject: BehaviorSubject<IDoodadCollection> = new BehaviorSubject<IDoodadCollection>({
    added: [],
    deleted: [],
    current: [],
  });

  constructor(private atdState: AdtState, private modelAssetProvider: IAssetProvider<ISceneObject>) {
    this.atdState.adt.subscribe({ next: this.onAdtChanged });
  }

  private loadDoodad = async (chunkId: number, item: DoodadItem) => {
    log.info(`Loading doodad filename:${item.doodad.filename} id:${item.doodad.id}`);

    const newFilename = item.doodad.filename.replace(`MDX`, `M2`);
    const newFilename2 = newFilename.replace(`MDL`, `M2`);
    const asset = await this.modelAssetProvider.start(newFilename2);
    const model = asset.object3d;

    if (item.canceled) {
      this.doodads.delete(item.doodad.id);
      const byChunk = this.chunkMap.get(item.chunkId);
      if (byChunk) {
        const index = byChunk.findIndex((value: DoodadItem) => {
          return value.doodad.id === item.doodad.id;
        });

        if (index !== -1) {
          byChunk!.splice(index, 1);
        }
      }
      return;
    }

    model.name = item.doodad.filename;
    const pos = new Vector3(  -(item.doodad.position.x - 17066),
                              item.doodad.position.y,
                              -(item.doodad.position.z - 17066));
    model.position.copy(pos);
    model.rotateX(item.doodad.rotation.x * Math.PI / 180);
    model.rotateY((item.doodad.rotation.y - 90) * Math.PI / 180);
    model.rotateZ(item.doodad.rotation.z * Math.PI / 180);

    const scale = item.doodad.scale / 1024;
    model.scale.copy(new Vector3(-scale, scale, -scale));
    model.updateMatrix();
    model.updateMatrixWorld(false);
    model.matrixAutoUpdate = false;

    const doodadInfo: IDoodadInfo = { id: item.doodad.id, model: asset };
    const current: IDoodadInfo[] =  [...this.doodads.values()].filter((entry) => {
      return entry.model !== null;
    }).map((entry) => {
      return { id: entry.doodad.id, model: entry.model! };
    });

    item.model = asset;

    this.doodadSubject.next({ added: [doodadInfo], current, deleted: [] });
    this.doodads.set(item.doodad.id, item);
  }

  private onAdtChanged = async (collection: IADTCollection) => {
    /*
    const k = JSON.stringify(collection, (key: string, value: any) => {
      if (key === 'adt') {
        return undefined;
      }

      return value;
    });

    log.info(`onAdtChanged ${k}`);
    */

    for (const info of collection.added) {
      const doodadEntries = info.adt.MCNKs[info.mcnkIndex].MCRF.doodadEntries;

      let chunkLookup = this.chunkMap.get(info.chunkId);
      if (!chunkLookup) {
        chunkLookup = [];
        this.chunkMap.set(info.chunkId, chunkLookup);
      }

      for (const doodadEntry of doodadEntries) {

        let doodadItem = this.doodads.get(doodadEntry.id);
        if (!doodadItem) {
          doodadItem = new DoodadItem(doodadEntry, info.chunkId);
          this.doodads.set(doodadEntry.id, doodadItem);
        }
        doodadItem.count++;

        chunkLookup.push(doodadItem);

        if (doodadItem.count === 1) {
          (this.loadDoodad)(info.chunkId, doodadItem);
        }
      }
    }

    // remove doodads associated with each deleted chunk
    if (collection.deleted.length > 0) {
      const deleted: number[] = [];
      for (const chunkId of collection.deleted) {
        if (this.chunkMap.has(chunkId)) {
          const doodads = this.chunkMap.get(chunkId);
          if (doodads) {
            for (const doodadItem of doodads) {
              doodadItem.count--;
              if (doodadItem.count === 0) {
                if (doodadItem.model) {
                  deleted.push(doodadItem.doodad.id);
                }
                else {
                  log.info(`Canceling doodad filename:${doodadItem.doodad.filename} id:${doodadItem.doodad.id}`);
                  doodadItem.canceled = true;
                }
                this.chunkMap.delete(chunkId);
              }
            }
          }
        }
      }

      for (const deletedId of deleted) {
        const doodadInfo = this.doodads.get(deletedId);
        if (doodadInfo) {
          log.info(`Unloading doodad filename:${doodadInfo.doodad.filename} id:${doodadInfo.doodad.id}`);
          if (doodadInfo.model) {
            doodadInfo.model.dispose();
            doodadInfo.model = null;
          }
          this.doodads.delete(deletedId);
        }
      }

      if (deleted.length > 0) {
        const current: IDoodadInfo[] =  [...this.doodads.values()].filter((entry) => {
          return entry.model !== null;
        }).map((entry) => {
          return { id: entry.doodad.id, model: entry.model! };
        });

        this.doodadSubject.next({
          added: [],
          current,
          deleted,
        });
      }
    }
  }
}
