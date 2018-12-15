import { lazyInject } from 'bawt/Container';
import { ILocation } from 'bawt/game/PlayerState';
import { chunkForTerrainCoordinate, chunksForArea, worldPosToTerrain } from 'bawt/utils/Functions';
import { IObject } from 'interface/IObject';
import { injectable } from 'inversify';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';

const chunkRadius = 8;

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

@injectable()
export class ChunksState implements IObject {
  @lazyInject('Observable<ILocation>')
  public location!: Observable<ILocation>;
  private locationSub: Subscription|null = null;

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
    this.locationSub = this.location.subscribe({ next: this.onLocationChanged });
  }

  private onLocationChanged = (location: ILocation) => {
    const terrainPos = worldPosToTerrain([location.position.x, location.position.y, location.position.z]);
    const chunkX = chunkForTerrainCoordinate(terrainPos.x);
    const chunkY = chunkForTerrainCoordinate(terrainPos.y);
    if (chunkX !== this.chunkX || chunkY !== this.chunkY) {
      const chunks = chunksForArea(chunkX, chunkY, chunkRadius);
      const diff = computeDifference(this.chunksCache, chunks);
      this._chunks.next(diff);
      this.chunksCache = chunks;
      this.chunkX = chunkX;
      this.chunkY = chunkY;
    }
  }

  public dispose = () => {
    if (this.locationSub) {
      this.locationSub.unsubscribe();
      this.locationSub = null;
    }
  }
}
