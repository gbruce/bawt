
import { LoadADT } from 'bawt/worker/LoadADT';
import { IHttpService } from 'interface/IHttpService';
import { IObject } from 'interface/IObject';
import { IAssetProvider } from 'interface/IAssetProvider';

export class ADT implements IObject {
  private static SIZE = 533.33333;
  private cache: { [path: string]: any; } = {};
  private tileX: any;
  private tileY: any;
  private x: any;
  private y: any;

  constructor(private httpService: IHttpService, private path: string, private data: any) {
    const tyx = this.path.match(/(\d+)_(\d+)\.adt$/);
    if (tyx != null) {
      this.tileX = +tyx[2];
      this.tileY = +tyx[1];
    }

    this.x = ADT.positionFor(this.tileX);
    this.y = ADT.positionFor(this.tileY);
  }

  public async initialize() {}
  public dispose() {}

  get wmos() {
    return this.data.MODF.entries;
  }

  get doodads() {
    return this.data.MDDF.entries;
  }

  get textures() {
    return this.data.MTEX.filenames;
  }

  public static positionFor(tile: any) {
    return (32 - tile) * this.SIZE;
  }

  public static tileFor(position: any) {
    return 32 - (position / this.SIZE) | 0;
  }

  public static loadTile( adtProvider: IAssetProvider<blizzardry.IADT>,
                          mapName: string, tileX: number, tileY: number, wdtFlags: number) {
    return ADT.load(adtProvider, `World\\Maps\\${mapName}\\${mapName}_${tileY}_${tileX}.adt`, wdtFlags);
  }

  public static loadAtCoords( adtProvider: IAssetProvider<blizzardry.IADT>,
                              mapName: string, x: number, y: number, wdtFlags: number) {
    const tileX = this.tileFor(x);
    const tileY = this.tileFor(y);
    return this.loadTile(adtProvider, mapName, tileX, tileY, wdtFlags);
  }

  public static async load(adtProvider: IAssetProvider<blizzardry.IADT>, path: string, wdtFlags: number) {
    return await adtProvider.start(path);
  }

}

export default ADT;
