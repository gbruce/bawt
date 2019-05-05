
import { chunkForTerrainCoordinate, chunksForArea, worldPosToTerrain } from 'bawt/utils/Functions';
import { IObject } from 'interface/IObject';
import { injectable, interfaces } from 'inversify';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { NewLogger } from 'bawt/utils/Logger';
import { IVector3 } from 'interface/IVector3';

const log = NewLogger('game/ChunkState');

const chunkRadius = 5;

export interface IChunkCollection {
  added: number[];
  deleted: number[];
  current: number[];
}

const computeDifference = (oldChunks: number[], newChunks: number[]): IChunkCollection => {
  const diff: IChunkCollection = {
    added: [],
    deleted: [],
    current: [],
  };

  for (const key of oldChunks) {
    if (!newChunks.includes(key)) {
      diff.deleted.push(key);
    }
  }

  for (const key of newChunks) {
    if (!oldChunks.includes(key)) {
      diff.added.push(key);
    }
    else {
      diff.current.push(key);
    }
  }

  return diff;
};

export type ChunksStateFactory = (position: Observable<IVector3>) => Promise<ChunksState>;

export const ChunksStateFactoryImpl = (context: interfaces.Context): ChunksStateFactory => {
  return async (position: Observable<IVector3>): Promise<ChunksState> => {
    const state = new ChunksState(position);
    await state.initialize();
    return state;
  };
};

@injectable()
export class ChunksState implements IObject {
  constructor(private position: Observable<IVector3>) {}
  private positionSub: Subscription|null = null;

  private chunkX: number = -1;
  private chunkY: number = -1;
  private chunksCache: number[] = [];

  private _chunks: BehaviorSubject<IChunkCollection> = new BehaviorSubject<IChunkCollection>({
    added: [],
    deleted: [],
    current: [],
  });

  public get chunks(): Observable<IChunkCollection> {
    return this._chunks;
  }

  public initialize = async () => {
    this.positionSub = this.position.subscribe({ next: this.onLocationChanged });
  }

  private onLocationChanged = (position: IVector3) => {
    // log.info(`onLocationChanged ${JSON.stringify(location)}`);
    const terrainPos = worldPosToTerrain([position.x, position.y, position.z]);
    const chunkX = chunkForTerrainCoordinate(terrainPos.x);
    const chunkY = chunkForTerrainCoordinate(terrainPos.y);
    if (chunkX !== this.chunkX || chunkY !== this.chunkY) {
      const chunks = chunksForArea(chunkX, chunkY, chunkRadius);

      let diff: IChunkCollection;
      diff = computeDifference(this.chunksCache, chunks);

      this._chunks.next(diff);
      this.chunksCache = chunks;
      this.chunkX = chunkX;
      this.chunkY = chunkY;
    }
  }

  public dispose = () => {
    if (this.positionSub) {
      this.positionSub.unsubscribe();
      this.positionSub = null;
    }
  }
}
