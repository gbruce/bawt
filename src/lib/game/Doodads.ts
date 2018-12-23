import { inject, injectable } from 'inversify';
import { Observable } from 'rxjs';
import { IADTCollection } from 'bawt/game/AdtState';
import { NewLogger } from 'bawt/utils/Logger';
import { IHttpService } from 'interface/IHttpService';
import { LoadModel } from 'bawt/worker/LoadModel';
import { Vector3, Object3D } from 'three';
import { M2Model } from 'bawt/assets/m2';

const log = NewLogger('game/Doodads');

@injectable()
export class Doodads {
  public root: Object3D = new Object3D();

  constructor(@inject('Observable<IADTCollection>') private adtColl: Observable<IADTCollection>,
              @inject('IHttpService') private httpService: IHttpService) {
    this.adtColl.subscribe({ next: this.onAdtChanged });
  }

  private onAdtChanged = async (collection: IADTCollection) => {
    for (const info of collection.added) {
      const chunkRoot: Object3D = new Object3D();
      chunkRoot.name = info.chunkId.toString();

      const doodadEntries = info.adt.MCNKs[info.id].MCRF.doodadEntries;
      for (const doodad of doodadEntries) {
        log.info(`Loading doodad filename:${doodad.filename}`);

        const modelLoader = new LoadModel(this.httpService);
        const newFilename = doodad.filename.replace(`MDX`, `M2`);
        const newFilename2 = newFilename.replace(`MDL`, `M2`);
        const model = await modelLoader.Start(newFilename2);
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
