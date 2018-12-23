import { lazyInject } from 'bawt/Container';
import { ILocation } from 'bawt/game/PlayerState';
import { chunkForTerrainCoordinate, chunksForArea, worldPosToTerrain } from 'bawt/utils/Functions';
import { IObject } from 'interface/IObject';
import { injectable } from 'inversify';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';

const chunkRadius = 5;

export interface IChunkCollection {
  map: string;
  added: number[];
  deleted: number[];
  current: number[];
}

const computeDifference = (map: string, oldChunks: number[], newChunks: number[]): IChunkCollection => {
  const diff: IChunkCollection = {
    map,
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
  @lazyInject('Observable<ILocation>') private location!: Observable<ILocation>;
  private locationSub: Subscription|null = null;

  private chunkX: number = -1;
  private chunkY: number = -1;
  private map: string = '';
  private chunksCache: number[] = [];

  private _chunks: BehaviorSubject<IChunkCollection> = new BehaviorSubject<IChunkCollection>({
    map: '',
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
    const mapSwitched = location.map !== this.map;
    const terrainPos = worldPosToTerrain([location.position.x, location.position.y, location.position.z]);
    const chunkX = chunkForTerrainCoordinate(terrainPos.x);
    const chunkY = chunkForTerrainCoordinate(terrainPos.y);
    if (chunkX !== this.chunkX || chunkY !== this.chunkY) {
      const chunks = chunksForArea(chunkX, chunkY, chunkRadius);

      let diff: IChunkCollection;
      if (mapSwitched) {
        diff = {
          added: chunks,
          current: [],
          deleted: this.chunksCache,
          map: location.map,
        };
      }
      else {
        diff = computeDifference(location.map, this.chunksCache, chunks);
        diff.map = location.map;
      }

      this._chunks.next(diff);
      this.chunksCache = chunks;
      this.chunkX = chunkX;
      this.chunkY = chunkY;
      this.map = location.map;
    }
  }

  public dispose = () => {
    if (this.locationSub) {
      this.locationSub.unsubscribe();
      this.locationSub = null;
    }
  }
}
