import { inject, injectable } from 'inversify';
import { Observable } from 'rxjs';
import { IADTCollection } from 'bawt/game/AdtState';
import { NewLogger } from 'bawt/utils/Logger';
import { Vector3, Object3D } from 'three';
import { M2Model } from 'bawt/assets/m2';
import { IAssetProvider } from 'interface/IAssetProvider';
import { ISceneObject } from 'interface/ISceneObject';

const log = NewLogger('game/Doodads');

@injectable()
export class Doodads {
  public root: Object3D = new Object3D();

  constructor(@inject('Observable<IADTCollection>') private adtColl: Observable<IADTCollection>,
              @inject('IAssetProvider<ISceneObject>') private modelAssetProvider: IAssetProvider<ISceneObject>) {
    // this.adtColl.subscribe({ next: this.onAdtChanged });
  }

  private onAdtChanged = async (collection: IADTCollection) => {
    for (const info of collection.added) {
      const chunkRoot: Object3D = new Object3D();
      chunkRoot.name = info.chunkId.toString();

      const doodadEntries = info.adt.MCNKs[info.mcnkIndex].MCRF.doodadEntries;
      for (const doodad of doodadEntries) {
        log.info(`Loading doodad filename:${doodad.filename}`);
        if (doodad.flags > 0) {
          const x = 1;
        }

        const newFilename = doodad.filename.replace(`MDX`, `M2`);
        const newFilename2 = newFilename.replace(`MDL`, `M2`);
        const model = (await this.modelAssetProvider.start(newFilename2)).object3d;
        model.name = doodad.filename;

        const pos = new Vector3(-(doodad.position.x - 17066), doodad.position.y, -(doodad.position.z - 17066));
        model.position.copy(pos);
        model.rotateX(doodad.rotation.x * Math.PI / 180);
        model.rotateY((doodad.rotation.y - 90) * Math.PI / 180);
        model.rotateZ(doodad.rotation.z * Math.PI / 180);

        const scale = doodad.scale / 1024;
        model.scale.copy(new Vector3(-scale, scale, -scale));
        model.updateMatrix();
        model.matrixAutoUpdate = false;

        chunkRoot.add(model);
      }
      this.root.add(chunkRoot);
    }

    for (const chunkId of collection.deleted) {
      const chunkRoot = this.root.getObjectByName(chunkId.toString());
      if (!chunkRoot) {
        continue;
      }
      for (let i = chunkRoot.children.length - 1; i >= 0; i--) {
        const model: M2Model = chunkRoot.children[i] as M2Model;
        log.info(`Unloading doodad filename:${model.name}`);
        model.dispose();
        this.root.remove(model);
      }
      this.root.remove(chunkRoot);
    }
    log.debug(`chunks:${this.root.children.length}`);
  }
}
