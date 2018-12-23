import Chunk from 'bawt/assets/adt/Chunk';
import { lazyInject } from 'bawt/Container';
import { ChunksState, IChunkCollection } from 'bawt/game/ChunksState';
import * as WDT from 'blizzardry/lib/wdt';
import { IHttpService } from 'interface/IHttpService';
import { IObject } from 'interface/IObject';
import { Subscription, Observable } from 'rxjs';
import { Object3D, Vector3, CylinderGeometry, MeshBasicMaterial, Mesh, Box3,
   BoxHelper, Sphere } from 'three';
import { LoadModel } from 'bawt/worker/LoadModel';
import { NewLogger } from 'bawt/utils/Logger';
import { ILocation } from 'bawt/game/PlayerState';
import { IADTCollection, IADTInfo } from 'bawt/game/AdtState';

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
  @lazyInject('ChunksState') private chunksState!: ChunksState;
  @lazyInject('IHttpService') private httpService!: IHttpService;
  @lazyInject('Observable<WDT.IWDT|null>') private wdtObs!: Observable<WDT.IWDT|null>;
  @lazyInject('Observable<IADTCollection>') private adtColl!: Observable<IADTCollection>;

  private chunksSub: Subscription|null = null;
  private wdtSub: Subscription|null = null;
  public root: Object3D = new Object3D();
  private chunks: Map<number, IChunkLoader> = new Map();
  private wdt: WDT.IWDT|null = null;
  private map: string = 'kalimdor';

  public initialize = async () => {
    this.wdtSub = this.wdtObs.subscribe({ next: (wdt: WDT.IWDT|null) => {
      this.wdt = wdt;
    }});
    // this.chunksSub = this.chunksState.chunks.subscribe({ next: this.onChunksChanged });
    this.adtColl.subscribe({ next: this.onAdtChanged });
  }

  private onAdtChanged = async (collection: IADTCollection) => {
    for (const info of collection.added) {
      const lookup = this.chunks.get(info.chunkId);
      if (!lookup) {
        const chunkLoader: IChunkLoader = { state: ChunkLoading.Fetching, chunk: null};
        this.chunks.set(info.chunkId, chunkLoader);

        const loading = async (adtInfo: IADTInfo, loader: IChunkLoader) => {
          const chunk = new Chunk(adtInfo.adt, adtInfo.id, adtInfo.tileX, adtInfo.tileY);
          loader.state = ChunkLoading.Initializing;
          loader.chunk = chunk;
          await chunk.initialize();

          loader.state = ChunkLoading.Loaded;
          chunk.name = `chunk-${adtInfo.chunkId}`;

          if (this.chunks.has(adtInfo.chunkId)) {
            // const vnh = new VertexNormalsHelper(chunk, 0.3, 0xff0000 );;
            this.root.add(chunk);
            // this.root.add(vnh);
          }
        };

        setTimeout(loading.bind(this, info, chunkLoader) , 0);
      }
    }

    for (const chunkId of collection.deleted) {
      const chunkLoader = this.chunks.get(chunkId);
      if (chunkLoader) {
        if (chunkLoader.chunk) {
          this.root.remove(chunkLoader.chunk);
          chunkLoader.chunk.dispose();
          chunkLoader.chunk = null;
        }

        this.chunks.delete(chunkId);
      }
    }
  }

  private onChunksChanged = (chunkCollection: IChunkCollection) => {
    if (!this.wdt) {
      return;
    }

    for (const chunkIdx of chunkCollection.added) {
      const lookup = this.chunks.get(chunkIdx);
      if (!lookup) {
        // we don't have it start loading it.
        const chunkLoader: IChunkLoader = { state: ChunkLoading.Fetching, chunk: null};
        this.chunks.set(chunkIdx, chunkLoader);

        const loading = async (chunkIndex: number, loader: IChunkLoader) => {
          const chunkX = (chunkIndex / chunksPerRow) | 0;
          const chunkY = chunkIndex % chunksPerRow;

          if (!this.wdt) {
            return;
          }

          const chunk = await Chunk.load(this.httpService, chunkCollection.map,
            this.wdt.flags, chunkX, chunkY);
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
            // const vnh = new VertexNormalsHelper(chunk, 0.3, 0xff0000 );;
            this.root.add(chunk);
            // this.root.add(vnh);
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
            // this.root.add(boxHelper);

            const axisRoot = new Object3D();
            axisRoot.position.copy(model.position);
            axisRoot.rotation.copy(model.rotation);
            axisRoot.updateMatrix();
            axisRoot.matrixAutoUpdate = false;
            // this.root.add(axisRoot);

            const radius = 0.05;
            const height = sphere.radius * 1.1;
            const arrowGeom = new CylinderGeometry(0, 2 * radius, height / 5);

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

        setTimeout(loading.bind(this, chunkIdx, chunkLoader) , 0);
      }
    }

    for (const chunkIndex of chunkCollection.deleted) {
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

    if (this.wdtSub) {
      this.wdtSub.unsubscribe();
      this.wdtSub = null;
    }
  }
}
