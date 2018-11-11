
import { LoadADT } from 'bawt/worker/LoadADT';
import { IHttpService } from 'interface/IHttpService';

export class ADT {
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

  public static loadTile(httpService: IHttpService, mapName: string, tileX: number, tileY: number, wdtFlags: number) {
    return ADT.load(httpService, `World\\Maps\\${mapName}\\${mapName}_${tileY}_${tileX}.adt`, wdtFlags);
  }

  public static loadAtCoords(httpService: IHttpService, mapName: string, x: number, y: number, wdtFlags: number) {
    const tileX = this.tileFor(x);
    const tileY = this.tileFor(y);
    return this.loadTile(httpService, mapName, tileX, tileY, wdtFlags);
  }

  public static async load(httpService: IHttpService, path: string, wdtFlags: number) {
    const loader = new LoadADT(httpService);
    return await loader.Start(path, wdtFlags);
  }

}

export default ADT;
