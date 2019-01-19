import Chunk from 'bawt/assets/adt/Chunk';
import { WMO } from 'bawt/assets/wmo';
import { lazyInject } from 'bawt/Container';
import { chunkForTerrainCoordinate, chunksForArea, terrainCoordToWorld,
  blockForTerrainCoordinates } from 'bawt/utils/Functions';
import { LoadWDT } from 'bawt/worker/LoadWDT';
import { LoadWMO } from 'bawt/worker/LoadWMO';
import { LoadModel } from 'bawt/worker/LoadModel';
import { LoadWMOGroup } from 'bawt/worker/LoadWMOGroup';
import { IHttpService } from 'interface/IHttpService';
import WMOGroup from 'bawt/assets/wmo/group/WMOGroup';
import { Object3D, Vector3, Quaternion, Euler, Group } from 'three';
import { M2Model } from 'bawt/assets/m2';
import { NewLogger } from 'bawt/utils/Logger';
import { ADT } from 'bawt/assets/adt';

const log = NewLogger('game/WorldMap');

const loadRadius = 1;
const doodadRadius = 0;

export class WorldMap {
  /*
  @lazyInject('IHttpService')
  public httpService!: IHttpService;

  public map: Object3D = new Object3D();

  public load = async (map: string, x: number, y: number, z: number) => {
    const mapPath = `World\\maps\\${map}\\${map}.wdt`;
    const wdtLoader = new LoadWDT(this.httpService);
    const wdt = await wdtLoader.Start(mapPath);
    const chunkX = chunkForTerrainCoordinate(x);
    const tileX = blockForTerrainCoordinates(x);
    const chunkY = chunkForTerrainCoordinate(y);
    const tileY = blockForTerrainCoordinates(y);
    const indices = chunksForArea(chunkX, chunkY, loadRadius);

    // LOAD CHUNKS
    const chunksPerRow = 16 * 64; // fixme
    const chunkloaders: Promise<Chunk|null>[] = [];
    indices.forEach(async (index) => {
      const perRow = chunksPerRow;
      const chunkX = (index / perRow) | 0;
      const chunkY = index % perRow;

      chunkloaders.push(Chunk.load(this.httpService, map, wdt.flags, chunkX, chunkY));
    });

    const chunks = await Promise.all(chunkloaders);

    // LOAD WMOs
    const wmoEntryMap: Map<string, blizzardry.IWMOEntry> = new Map();
    const wmoLoaders: Promise<blizzardry.IWMO|null>[] = [];
    for (const c of chunks) {
      if (c) {
        if (c.wmoEntries.length > 0) {
          for (const wmo of c.wmoEntries) {
            const wmoLoader = new LoadWMO(this.httpService);
            wmoLoaders.push(wmoLoader.Start(wmo.filename));
            wmoEntryMap.set(wmo.filename, wmo);
          }
        }
      }
    }

    const wmos = await Promise.all(wmoLoaders);

    const zeroPad = (num: number, places: number) => {
      var zero = places - num.toString().length + 1;
      return Array(+(zero > 0 && zero)).join("0") + num;
    }

    // LOAD WMO GROUPS
    const wmoGroupMap: Map<string, blizzardry.IWMO> = new Map();
    const wmoGroupLoaders: Promise<blizzardry.IWMOGroup|null>[] = [];
    for (const wmo of wmos) {
      if (wmo) {
        const wmoBase = wmo.filename.substr(0, wmo.filename.length-4);
        const wmoRoot = new WMO(wmo);
        for (let i = 0; i<wmo.MOHD.groupCount; i++) {
          const group = wmo.MOGI.groups[i];
          const wmoGroupFile = `${wmoBase}_${zeroPad(i,3)}.wmo`;
          const wmoGroupLoader = new LoadWMOGroup(this.httpService);
          wmoGroupLoaders.push(wmoGroupLoader.Start(wmoGroupFile));
          wmoGroupMap.set(wmoGroupFile, wmo);
        }
      }
    }

    const playerWorldPos = new Vector3(y, z, x);
    const wmoGroups = await Promise.all(wmoGroupLoaders);
    const doodadMap: Map<string, any> = new Map();
    const doodadLoad: Promise<M2Model>[] = [];
    for (const wmoGroup of wmoGroups) {
      if (wmoGroup) {
        const wmo = wmoGroupMap.get(wmoGroup.filename);
        if (wmo) {
          const wmoEntry = wmoEntryMap.get(wmo.filename);
          if (!wmoEntry) {
            continue;
          }

          const position: number[] = [wmoEntry.position.x, wmoEntry.position.y, wmoEntry.position.z];
          const rotation: number[] = [wmoEntry.rotation.x, 270 - wmoEntry.rotation.y, wmoEntry.rotation.z]
          const wmoM = terrainCoordToWorld(position, rotation);
          for (const doodad of wmo.MODD.doodads) {
            const d = new Vector3(doodad.position.x, doodad.position.y, doodad.position.z);
            d.applyMatrix4(wmoM);
            const doodadPos = [doodad.position.x + wmoEntry.position.x, doodad.position.y + wmoEntry.position.y, doodad.position.z + wmoEntry.position.z];
            const doodadWorldM = terrainCoordToWorld(doodadPos, [0,0,0]);
            const doodadWorldPos = new Vector3();
            const rot = new Quaternion();
            doodadWorldM.decompose(doodadWorldPos, rot, new Vector3());
            const distance = d.distanceTo(playerWorldPos);
            if(distance < doodadRadius) {
              const modelLoader = new LoadModel(this.httpService);
              const newFilename = doodad.filename.replace(`MDX`, `M2`);
              const newFilename2 = newFilename.replace(`MDL`, `M2`);
              doodadLoad.push(modelLoader.Start(newFilename2));
              doodadMap.set(newFilename2, doodad);
            }
          }
        }
      }
    }

    const doodads = await Promise.all(doodadLoad);

    await this.loadWmoGroups(x, y, z, wmoGroups, wmoGroupMap, wmoEntryMap, doodads, doodadMap);

    for (const c of chunks) {
    }
  };

  private async loadWmoGroups(playerX: number, playerY: number, playerZ: number,
                              wmoGroups: (blizzardry.IWMOGroup|null)[],
                              wmoGroupMap: Map<string, blizzardry.IWMO>,
                              wmoEntryMap: Map<string, blizzardry.IWMOEntry>,
                              doodads: M2Model[],
                              doodadMap: Map<string, any>) {
    const playerWorldPos = new Vector3(playerY, playerZ, playerX);

    for (let wmoGroup of wmoGroups) {
      if (wmoGroup) {
        const wmo = wmoGroupMap.get(wmoGroup.filename);
        if (wmo) {
          const wmoEntry = wmoEntryMap.get(wmo.filename);
          if (!wmoEntry) {
            continue;
          }

          let wmoObject: Object3D = this.map.getObjectByName(wmo.filename);
          if (!wmoObject) {
            wmoObject = new Group();
            wmoObject.name = wmo.filename;

            const position: number[] = [wmoEntry.position.x, wmoEntry.position.y, wmoEntry.position.z];
            const rotation: number[] = [wmoEntry.rotation.x, 270 - wmoEntry.rotation.y, wmoEntry.rotation.z];
            const m = terrainCoordToWorld(position, rotation);
            const pos = new Vector3();
            const rot = new Quaternion();
            m.decompose(pos, rot, new Vector3());

            wmoObject.setRotationFromQuaternion(rot);
            wmoObject.position.copy(pos);
            wmoObject.updateMatrix();
            wmoObject.matrixAutoUpdate = false;

            log.info(`Place WMO:${wmoEntry.filename} pos: ${JSON.stringify(pos)} rot:${JSON.stringify(rot)}`);

            this.map.add(wmoObject);
          }


          // log.info(`place wmo:${wmoEntry.filename} rot:${rotation}`);
          const group = new WMOGroup(wmo, '', wmoGroup);
          await group.initialize();
          group.matrixAutoUpdate = false;
          wmoObject.add(group);
          
          // const box = new BoxHelper(group, new Color(0, 50, 0));
          // this.map.add(box);

          // const axis = new AxesHelper(50);
          // axis.position.copy(pos);
          // axis.quaternion.copy(rot);
          // this.map.add(axis);

          for (const model of doodads) {
            const doodadData = doodadMap.get(model.path);
            log.info(`Place Doodad filename:${doodadData.filename}`);
            const pos = new Vector3(doodadData.position.x, doodadData.position.z, -doodadData.position.y);
            const rot = new Quaternion(doodadData.rotation.x, doodadData.rotation.y, doodadData.rotation.z, doodadData.rotation.w);
            const euler = new Euler().setFromQuaternion(rot);
            const euler2 = new Euler(euler.x, euler.z, euler.y);
            model.position.copy(pos);
            model.setRotationFromEuler(euler2);
            model.scale.copy(new Vector3(doodadData.scale, doodadData.scale, doodadData.scale));
            model.updateMatrix();
            group.matrixAutoUpdate = false;
            wmoObject.add(model);
            // const box = new BoxHelper(group, new Color(50, 0, 0));
            // this.map.add(box);
          }
        }
      }
    }
  }
  */
}
