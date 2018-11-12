import Chunk from 'bawt/assets/adt/Chunk';
import { WMO } from 'bawt/assets/wmo';
import { lazyInject } from 'bawt/Container';
import { chunkForTerrainCoordinate, chunksForArea, terrainCoordToWorld, blockForTerrainCoordinates } from 'bawt/utils/Functions';
import { LoadWDT } from 'bawt/worker/LoadWDT';
import { LoadWMO } from 'bawt/worker/LoadWMO';
import { LoadWMOGroup } from 'bawt/worker/LoadWMOGroup';
import { IHttpService } from 'interface/IHttpService';
import WMOGroup from 'bawt/assets/wmo/group/WMOGroup';
import { Object3D, BoxHelper, Color, Box3, Vector3, Quaternion, Matrix4, AxesHelper, BoundingBoxHelper } from 'three';
import { LoadM2 } from 'bawt/worker/LoadM2';
import { M2Model } from 'bawt/assets/m2';

const loadRadius = 1;

export class WorldMap {
  @lazyInject('IHttpService')
  public httpService!: IHttpService;

  public map: Object3D = new Object3D();

  public load = async (map: string, x: number, y: number) => {
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
      if (c && c.wmoEntries.length > 0) {
        for (const wmo of c.wmoEntries) {
          const wmoLoader = new LoadWMO(this.httpService);
          wmoLoaders.push(wmoLoader.Start(wmo.filename));
          wmoEntryMap.set(wmo.filename, wmo);
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

    const wmoGroups = await Promise.all(wmoGroupLoaders);
    const doodadMap: Map<string, any> = new Map();
    const doodadLoad: Promise<any|null>[] = [];
    for (const wmoGroup of wmoGroups) {
      if (wmoGroup) {
        const wmo = wmoGroupMap.get(wmoGroup.filename);
        if (wmo) {
          const wmoEntry = wmoEntryMap.get(wmo.filename);
          if (!wmoEntry) {
            continue;
          }

          for (const doodad of wmo.MODD.doodads) {
            const m2Loader = new LoadM2(this.httpService);
            const newFilename = doodad.filename.replace(`MDX`, `M2`);
            const newFilename2 = newFilename.replace(`MDL`, `M2`);
            doodadLoad.push(m2Loader.Start(newFilename2));
            doodadMap.set(newFilename2, doodad);
          }
        }
      }
    }

    const doodads = await Promise.all(doodadLoad);

    for (const wmoGroup of wmoGroups) {
      if (wmoGroup) {
        const wmo = wmoGroupMap.get(wmoGroup.filename);
        if (wmo) {
          const wmoEntry = wmoEntryMap.get(wmo.filename);
          if (!wmoEntry) {
            continue;
          }
          const group = new WMOGroup(wmo, '', wmoGroup);
          const position: number[] = [wmoEntry.position.x, wmoEntry.position.y, wmoEntry.position.z];
          const rotation: number[] = [wmoEntry.rotation.x, wmoEntry.rotation.y, wmoEntry.rotation.z]
          const m = terrainCoordToWorld(position, rotation);
          const pos = new Vector3();
          const rot = new Quaternion();
          m.decompose(pos, rot, new Vector3());
          group.quaternion.copy(rot);
          group.position.copy(pos);
          group.updateMatrix();
          group.matrixAutoUpdate = false;
          this.map.add(group);
          
          const box = new BoxHelper(group, new Color(0, 50, 0));
          this.map.add(box);

          const axis = new AxesHelper(50);
          axis.position.copy(pos);
          axis.quaternion.copy(rot);
          this.map.add(axis);

          for (const doodad of doodads) {
            const model = new M2Model(doodad.filename, doodad.m2, doodad.skin);
            model.updateMatrix();
            const doodadData = doodadMap.get(doodad.filename);
            const pos = new Vector3(doodadData.position[0], doodadData.position[1], doodadData.position[2]);
            model.position.copy(pos);
            model.scale.copy(new Vector3(doodadData.scale, doodadData.scale, doodadData.scale));
            group.add(model);
            const box = new BoxHelper(group, new Color(50, 0, 0));
            this.map.add(box);
          }
        }
      }
    }
  };
}
