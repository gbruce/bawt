import Chunk from 'bawt/assets/adt/Chunk';
import { lazyInject } from 'bawt/Container';
import { ChunksState } from 'bawt/game/ChunksState';
import { LoadWDT } from 'bawt/worker/LoadWDT';
import * as WDT from 'blizzardry/lib/wdt';
import { IHttpService } from 'interface/IHttpService';
import { IObject } from 'interface/IObject';
import { Subscription } from 'rxjs';
import { Object3D, Vector3, CylinderGeometry, MeshBasicMaterial, Mesh, Box3, BoxHelper, Sphere, VertexNormalsHelper } from 'three';
import { PlayerState } from 'bawt/game/PlayerState';
import { LoadModel } from 'bawt/worker/LoadModel';
import { NewLogger } from 'bawt/utils/Logger';

const log = NewLogger('game/Terrain');

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

  @lazyInject('PlayerState')
  public player!: PlayerState;

  private wdt: WDT.IWDT|null = null;
  private chunksSub: Subscription|null = null;
  public root: Object3D = new Object3D();
  private chunks: Map<number, IChunkLoader> = new Map();

  public initialize = async () => {
    const mapPath = `World\\maps\\${this.player.map.subject.value}\\${this.player.map.subject.value}.wdt`;
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

          if (!this.wdt) {
            return;
          }

          const chunk = await Chunk.load(this.httpService, this.player.map.subject.value, this.wdt.flags, chunkX, chunkY);
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
            const vnh = new VertexNormalsHelper(chunk, 0.3, 0xff0000 );;
            this.root.add(chunk);
            this.root.add(vnh);
          }

          for (const doodad of chunk.doodadEntries) {
            log.info(`Loading doodad filename:${doodad.filename}`);

            const modelLoader = new LoadModel(this.httpService);
            const newFilename = doodad.filename.replace(`MDX`, `M2`);
            const newFilename2 = newFilename.replace(`MDL`, `M2`);
            const model = await modelLoader.Start(newFilename2);
            
            const pos = new Vector3(-(doodad.position.x - 17066), doodad.position.y, -(doodad.position.z - 17066));
            model.position.copy(pos);
            model.rotateX(doodad.rotation.x * Math.PI / 180);
            model.rotateY((doodad.rotation.y) * Math.PI / 180);
            model.rotateZ(doodad.rotation.z * Math.PI / 180);

            const scale = doodad.scale / 1024;
            model.scale.copy(new Vector3(-scale, scale, -scale));
            model.updateMatrix();
            model.matrixAutoUpdate = false;

            this.root.add(model);

            const box = new Box3();
            box.setFromObject(model);
            const sphere = new Sphere();
            box.getBoundingSphere(sphere);

            const boxHelper = new BoxHelper(model);
            //this.root.add(boxHelper);

            const axisRoot = new Object3D();
            axisRoot.position.copy(model.position);
            axisRoot.rotation.copy(model.rotation);
            axisRoot.updateMatrix();
            axisRoot.matrixAutoUpdate = false;
            //this.root.add(axisRoot);

            const radius = 0.05;
            const height = sphere.radius * 1.1;
            const arrowGeom = new CylinderGeometry(0,2 * radius, height /5);

            const xAxisMat = new MeshBasicMaterial({ color: 0xff0000});
            const xAxisGeom = new CylinderGeometry(radius, radius, height);
            const xAxisMesh = new Mesh(xAxisGeom, xAxisMat);
            const xArrowMesh = new Mesh(arrowGeom, xAxisMat);
            xAxisMesh.add(xArrowMesh);
            xArrowMesh.position.y += height / 2;
            xAxisMesh.rotation.z -= 90 * Math.PI / 180;
            xAxisMesh.position.x += height / 2;
            axisRoot.add(xAxisMesh);

            const yAxisMat = new MeshBasicMaterial({ color: 0x00ff00});
            const yAxisGeom = new CylinderGeometry(radius, radius, height);
            const yAxisMesh = new Mesh(yAxisGeom, yAxisMat);
            const yArrowMesh = new Mesh(arrowGeom, yAxisMat);
            yAxisMesh.add(yArrowMesh);
            yArrowMesh.position.y += height / 2;
            yAxisMesh.position.y += height / 2;
            axisRoot.add(yAxisMesh);

            const zAxisMat = new MeshBasicMaterial({ color: 0x0000ff});
            const zAxisGeom = new CylinderGeometry(radius, radius, height);
            const zAxisMesh = new Mesh(zAxisGeom, zAxisMat);
            const zArrowMesh = new Mesh(arrowGeom, zAxisMat);
            zAxisMesh.add(zArrowMesh);
            zAxisMesh.rotation.x += 90 * Math.PI / 180;
            zArrowMesh.position.y += height / 2;
            zAxisMesh.position.z += height / 2;
            axisRoot.add(zAxisMesh);
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
