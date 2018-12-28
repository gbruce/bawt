import { inject, injectable } from 'inversify';
import { NewLogger } from 'bawt/utils/Logger';
import { Vector3, Object3D, Group, Quaternion } from 'three';
import { IADTCollection } from 'bawt/game/AdtState';
import { LoadWMO } from 'bawt/worker/LoadWMO';
import { WMO } from 'bawt/assets/wmo';
import { LoadWMOGroup } from 'bawt/worker/LoadWMOGroup';
import { terrainCoordToWorld } from 'bawt/utils/Functions';
import WMOGroup from 'bawt/assets/wmo/group/WMOGroup';
import { IHttpService } from 'interface/IHttpService';
import { Observable } from 'rxjs';

const log = NewLogger('game/WorldModels');

@injectable()
export class WorldModels {
  public root: Object3D = new Object3D();

  constructor(@inject('Observable<IADTCollection>') private adtColl: Observable<IADTCollection>,
              @inject('IHttpService') private httpService: IHttpService) {
    this.adtColl.subscribe({ next: this.onAdtChanged });
  }

  private onAdtChanged = async (collection: IADTCollection) => {
    for (const info of collection.added) {
      const chunkRoot: Object3D = new Object3D();
      chunkRoot.name = info.chunkId.toString();

      const wmoEntries = info.adt.MCNKs[info.id].MCRF.wmoEntries;
      for (const wmoEntry of wmoEntries) {
        log.info(`Loading wmo filename:${wmoEntry.filename}`);

        const wmoLoader = new LoadWMO(this.httpService);
        const wmo = await wmoLoader.Start(wmoEntry.filename);
        if (!wmo) {
          continue;
        }

        let wmoSceneRoot = chunkRoot.getObjectByName(wmo.filename);
        if (!wmoSceneRoot) {
          wmoSceneRoot = new Group();
          wmoSceneRoot.name = wmo.filename;

          const position: number[] = [wmoEntry.position.x, wmoEntry.position.y, wmoEntry.position.z];
          const rotation: number[] = [wmoEntry.rotation.x, 270 - wmoEntry.rotation.y, wmoEntry.rotation.z];
          const m = terrainCoordToWorld(position, rotation);
          const resultPos = new Vector3();
          const resultRot = new Quaternion();
          m.decompose(resultPos, resultRot, new Vector3());

          wmoSceneRoot.setRotationFromQuaternion(resultRot);
          wmoSceneRoot.position.copy(resultPos);
          wmoSceneRoot.updateMatrix();
          wmoSceneRoot.matrixAutoUpdate = false;

          log.info(`Place WMO:${wmoEntry.filename} pos: ${JSON.stringify(resultPos)} rot:${JSON.stringify(resultRot)}`);

          chunkRoot.add(wmoSceneRoot);
        }

        const zeroPad = (num: number, places: number) => {
          const zero = places - num.toString().length + 1;
          return Array(+(zero > 0 && zero)).join('0') + num;
        };

        const wmoBase = wmo.filename.substr(0, wmo.filename.length - 4);
        const wmoRoot = new WMO(wmo);
        for (let i = 0; i < wmo.MOHD.groupCount; i++) {
          const group = wmo.MOGI.groups[i];
          const wmoGroupFile = `${wmoBase}_${zeroPad(i, 3)}.wmo`;
          const wmoGroupLoader = new LoadWMOGroup(this.httpService);
          const wmoGroup = await wmoGroupLoader.Start(wmoGroupFile);

          if (wmoGroup) {
            const grp = new WMOGroup(wmo, '', wmoGroup);
            grp.name = wmoGroup.filename;
            await grp.initialize();
            grp.matrixAutoUpdate = false;
            wmoSceneRoot.add(grp);
          }
        }
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
      this.root.add(chunkRoot);
    }
  }
}
