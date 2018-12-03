import { lazyInject } from 'bawt/Container';
import { PlayerState } from 'bawt/game/PlayerState';
import { chunkForTerrainCoordinate, chunksForArea, worldPosToTerrain } from 'bawt/utils/Functions';
import { IObject } from 'interface/IObject';
import { IVector3 } from 'interface/IVector3';
import { injectable } from 'inversify';
import { BehaviorSubject, Subscription } from 'rxjs';

const chunkRadius = 2;

@injectable()
export class ChunksState implements IObject {
  @lazyInject('PlayerState')
  public player!: PlayerState;
  private playerPositionSub: Subscription|null = null;

  private chunkX: number = -1;
  private chunkY: number = -1;
  private _chunksSubject: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);

  public get chunksSubject(): BehaviorSubject<number[]> {
    return this._chunksSubject;
  }

  public initialize = async () => {
    this.playerPositionSub = this.player.position.subject.subscribe({ next: this.onPositionChanged });
  }

  private onPositionChanged = (position: IVector3) => {
    const terrainPos = worldPosToTerrain([position.x, position.y, position.z]);
    const chunkX = chunkForTerrainCoordinate(terrainPos.x);
    const chunkY = chunkForTerrainCoordinate(terrainPos.y);
    if (chunkX != this.chunkX || chunkY != this.chunkY) {
      this.chunkX = chunkX;
      this.chunkY = chunkY;
      const chunks = chunksForArea(chunkX, chunkY, chunkRadius);
      this._chunksSubject.next(chunks);
    }
  }

  public dispose = () => {
    if (this.playerPositionSub) {
      this.playerPositionSub.unsubscribe();
      this.playerPositionSub = null;
    }
  }
}
