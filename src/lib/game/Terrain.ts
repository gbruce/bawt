import Chunk from 'bawt/assets/adt/Chunk';
import { lazyInject } from 'bawt/Container';
import { IObject } from 'interface/IObject';
import { Observable } from 'rxjs';
import { Object3D } from 'three';
import { NewLogger } from 'bawt/utils/Logger';
import { IADTCollection, IADTInfo } from 'bawt/game/AdtState';
import { IAssetProvider } from 'interface/IAssetProvider';
import { ISceneObject } from 'interface/ISceneObject';

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
  @lazyInject('Observable<IADTCollection>') private adtColl!: Observable<IADTCollection>;
  @lazyInject('IAssetProvider<blizzardry.IADT>') private adtProvider!: IAssetProvider<blizzardry.IADT>;
  @lazyInject('IAssetProvider<ISceneObject>') private modelProvider!: IAssetProvider<ISceneObject>;

  public root: Object3D = new Object3D();
  private chunks: Map<number, IChunkLoader> = new Map();

  public initialize = async () => {
    this.adtColl.subscribe({ next: this.onAdtChanged });
  }

  private onAdtChanged = async (collection: IADTCollection) => {
    for (const info of collection.added) {
      const lookup = this.chunks.get(info.chunkId);
      if (!lookup) {
        const chunkLoader: IChunkLoader = { state: ChunkLoading.Fetching, chunk: null};
        this.chunks.set(info.chunkId, chunkLoader);

        const loading = async (adtInfo: IADTInfo, loader: IChunkLoader) => {
          const chunk = new Chunk(adtInfo.adt, adtInfo.mcnkIndex, adtInfo.tileX, adtInfo.tileY);
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

  //           const box = new Box3();
  //           box.setFromObject(model);
  //           const sphere = new Sphere();
  //           box.getBoundingSphere(sphere);

  //           const boxHelper = new BoxHelper(model);
  //           // this.root.add(boxHelper);

  //           const axisRoot = new Object3D();
  //           axisRoot.position.copy(model.position);
  //           axisRoot.rotation.copy(model.rotation);
  //           axisRoot.updateMatrix();
  //           axisRoot.matrixAutoUpdate = false;
  //           // this.root.add(axisRoot);

  //           const radius = 0.05;
  //           const height = sphere.radius * 1.1;
  //           const arrowGeom = new CylinderGeometry(0, 2 * radius, height / 5);

  //           const xAxisMat = new MeshBasicMaterial({ color: 0xff0000});
  //           const xAxisGeom = new CylinderGeometry(radius, radius, height);
  //           const xAxisMesh = new Mesh(xAxisGeom, xAxisMat);
  //           const xArrowMesh = new Mesh(arrowGeom, xAxisMat);
  //           xAxisMesh.add(xArrowMesh);
  //           xArrowMesh.position.y += height / 2;
  //           xAxisMesh.rotation.z -= 90 * Math.PI / 180;
  //           xAxisMesh.position.x += height / 2;
  //           axisRoot.add(xAxisMesh);

  //           const yAxisMat = new MeshBasicMaterial({ color: 0x00ff00});
  //           const yAxisGeom = new CylinderGeometry(radius, radius, height);
  //           const yAxisMesh = new Mesh(yAxisGeom, yAxisMat);
  //           const yArrowMesh = new Mesh(arrowGeom, yAxisMat);
  //           yAxisMesh.add(yArrowMesh);
  //           yArrowMesh.position.y += height / 2;
  //           yAxisMesh.position.y += height / 2;
  //           axisRoot.add(yAxisMesh);

  //           const zAxisMat = new MeshBasicMaterial({ color: 0x0000ff});
  //           const zAxisGeom = new CylinderGeometry(radius, radius, height);
  //           const zAxisMesh = new Mesh(zAxisGeom, zAxisMat);
  //           const zArrowMesh = new Mesh(arrowGeom, zAxisMat);
  //           zAxisMesh.add(zArrowMesh);
  //           zAxisMesh.rotation.x += 90 * Math.PI / 180;
  //           zArrowMesh.position.y += height / 2;
  //           zAxisMesh.position.z += height / 2;
  //           axisRoot.add(zAxisMesh);

  public dispose = () => {}
}
