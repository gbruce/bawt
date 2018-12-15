import { lazyInject } from 'bawt/Container';
import { PlayerState } from 'bawt/game/PlayerState';
import { chunkForTerrainCoordinate, chunksForArea, worldPosToTerrain } from 'bawt/utils/Functions';
import { IObject } from 'interface/IObject';
import { IVector3 } from 'interface/IVector3';
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
  @lazyInject('PlayerState')
  public player!: PlayerState;
  private playerPositionSub: Subscription|null = null;

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
    this.playerPositionSub = this.player.position.subject.subscribe({ next: this.onPositionChanged });
  }

  private onPositionChanged = (position: IVector3) => {
    const terrainPos = worldPosToTerrain([position.x, position.y, position.z]);
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
    if (this.playerPositionSub) {
      this.playerPositionSub.unsubscribe();
      this.playerPositionSub = null;
    }
  }
}
