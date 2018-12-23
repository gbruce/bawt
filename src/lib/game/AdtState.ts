import { IChunkCollection } from 'bawt/game/ChunksState';
import { inject, injectable } from 'inversify';
import { Observable, BehaviorSubject } from 'rxjs';
import { IHttpService } from 'interface/IHttpService';
import { LoadADT } from 'bawt/worker/LoadADT';
import { NewLogger } from 'bawt/utils/Logger';

const log = NewLogger('game/AdtState');

const chunksPerRow = 16 * 64; // fixme
const SIZE = 533.33333;

interface ILoading {
  canceled: boolean;
}

export interface IADTInfo {
  chunkId: number;
  tileX: number;
  tileY: number;
  chunkX: number;
  chunkY: number;
  id: number;
  adt: blizzardry.IADT;
}

export interface IADTCollection {
  added: IADTInfo[];
  deleted: number[]; // chunkdId
  current: IADTInfo[];
}

@injectable()
export class AdtState {
  private loading: Map<number, ILoading> = new Map();
  private adts: Map<number, IADTInfo> = new Map();

  private adtSubject: BehaviorSubject<IADTCollection> = new BehaviorSubject<IADTCollection>({
    added: [],
    deleted: [],
    current: [],
  });
  public get adt(): Observable<IADTCollection> {
    return this.adtSubject;
  }

  constructor(@inject('Observable<IChunkCollection>') private chunks: Observable<IChunkCollection>,
              @inject('IHttpService') private httpService: IHttpService) {
    this.chunks.subscribe(this.onCollectionChanged);
  }

  private tileFor(chunkPosition: number) {
    return (chunkPosition / 16) | 0;
  }

  private onCollectionChanged = (collection: IChunkCollection) => {
    for (const add of collection.added) {
      if (!this.loading.has(add)) {
        this.loading.set(add, { canceled: false});

        ((chunkId: number) => {
          const chunkX = (chunkId / chunksPerRow) | 0;
          const chunkY = chunkId % chunksPerRow;

          const tileX = this.tileFor(chunkX);
          const tileY = this.tileFor(chunkY);

          const offsetX = chunkX - tileX * 16;
          const offsetY = chunkY - tileY * 16;

          const id = offsetX * 16 + offsetY;
          const path = `World\\Maps\\${collection.map}\\${collection.map}_${tileY}_${tileX}.adt`;
          const loader = new LoadADT(this.httpService);

          // TODO: add wdt flags here
          loader.Start(path, {}).then((adt: blizzardry.IADT) => {
            const loadingState = this.loading.get(chunkId);
            if (loadingState) {
              this.loading.delete(chunkId);
              if (!loadingState.canceled) {
                const adtInfo: IADTInfo = {
                  adt,
                  chunkId,
                  tileX,
                  tileY,
                  chunkX,
                  chunkY,
                  id,
                };

                this.adtSubject.next({
                  added: [adtInfo],
                  current: [...this.adts.values()],
                  deleted: [],
                });

                this.adts.set(chunkId, adtInfo);
              }
            }
          });
        })(add);
      }
    }

    for (const remove of collection.deleted) {
      const loading = this.loading.get(remove);
      if (loading) {
        loading.canceled = true;
      }

      const adt = this.adts.get(remove);
      if (adt) {
        this.adts.delete(remove);
      }
    }

    if (collection.deleted.length > 0) {
      this.adtSubject.next({
        added: [],
        current: [...this.adts.values()],
        deleted: collection.deleted,
      });
    }
  }
}
