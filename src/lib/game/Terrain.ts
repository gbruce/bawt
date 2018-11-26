import Chunk from 'bawt/assets/adt/Chunk';
import { lazyInject } from 'bawt/Container';
import { ChunksState } from 'bawt/game/ChunksState';
import { LoadWDT } from 'bawt/worker/LoadWDT';
import * as WDT from 'blizzardry/lib/wdt';
import { IHttpService } from 'interface/IHttpService';
import { IObject } from 'interface/IObject';
import { Subscription } from 'rxjs';
import { Object3D } from 'three';

enum ChunkLoading {
  Fetching,
  Initializing,
  Loaded,
}

interface IChunkLoader {
  state: ChunkLoading;
  chunk: Chunk|null;
}

const chunksPerRow = 16 * 64; // fixme

export class Terrain implements IObject {
  @lazyInject('ChunksState')
  public chunksState!: ChunksState;

  @lazyInject('IHttpService')
  public httpService!: IHttpService;

  private map: string = 'azeroth';
  private wdt: WDT.IWDT|null = null;
  private chunksSub: Subscription|null = null;
  public root: Object3D = new Object3D();
  private chunks: Map<number, IChunkLoader> = new Map();

  public initialize = async () => {
    const mapPath = `World\\maps\\${this.map}\\${this.map}.wdt`;
    const wdtLoader = new LoadWDT(this.httpService);
    this.wdt = await wdtLoader.Start(mapPath);

    this.chunksSub = this.chunksState.chunksSubject.subscribe({ next: this.onChunksChanged });
  } 
  
  private onChunksChanged = (chunks: number[]) => {
    if (!this.wdt) {
      return;
    }

    const removedChunks: number[] = [];
    for (const key of this.chunks) {
      if (!chunks.includes(key[0])) {
        removedChunks.push(key[0]);
      }
    }

    for (const chunkIndex of chunks) {
      const lookup = this.chunks.get(chunkIndex);
      if (!lookup) {
        // we don't have it start loading it.
        const loader: IChunkLoader = { state: ChunkLoading.Fetching, chunk: null};
        this.chunks.set(chunkIndex, loader);
        
        const loading = async (chunkIndex: number, loader: IChunkLoader) => {
          const chunkX = (chunkIndex / chunksPerRow) | 0;
          const chunkY = chunkIndex % chunksPerRow;

          const chunk = await Chunk.load(this.httpService, 'azeroth', this.wdt!.flags, chunkX, chunkY);
          if (!chunk) {
            this.chunks.delete(chunkIndex);
            return;
          }

          loader.state = ChunkLoading.Initializing;
          loader.chunk = chunk;
          await chunk.initialize();

          loader.state = ChunkLoading.Loaded;
          chunk.name = `chunk-${chunkIndex}`;

          if (this.chunks.has(chunkIndex)) {
            this.root.add(chunk);
          }
        };

        setTimeout(loading.bind(this, chunkIndex, loader) , 0);        
      }
    }

    for (const chunkIndex of removedChunks) {
      const chunkLoader = this.chunks.get(chunkIndex);
      if (chunkLoader) {
        if (chunkLoader.chunk) {
          this.root.remove(chunkLoader.chunk);
        }
        
        this.chunks.delete(chunkIndex);
      }
    }
  }

  public dispose = () => {
    if (this.chunksSub) {
      this.chunksSub.unsubscribe();
      this.chunksSub = null;
    }
  }
}
