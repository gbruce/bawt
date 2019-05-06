import * as WDT from 'blizzardry/lib/wdt';
import { IObject } from 'interface/IObject';
import { BehaviorSubject, Observable } from 'rxjs';
import { injectable, interfaces } from 'inversify';
import { IAssetProvider } from 'interface/IAssetProvider';

export type WdtStateFactory = (map: string, wdtAssetProvider: IAssetProvider<WDT.IWDT>) => Promise<WdtState>;

export const WdtStateFactoryImpl = (context: interfaces.Context): WdtStateFactory => {
  return async (map: string, wdtAssetProvider: IAssetProvider<WDT.IWDT>): Promise<WdtState> => {
    return new WdtState(map, wdtAssetProvider);
  };
};

export class WdtState implements IObject {
  constructor(private map: string, private wdtAssetProvider: IAssetProvider<WDT.IWDT>) {
  }

  private _wdtSubject: BehaviorSubject<WDT.IWDT|null> = new BehaviorSubject<WDT.IWDT|null>(null);
  public get wdtSubject(): Observable<WDT.IWDT|null> {
    return this._wdtSubject;
  }

  public async initialize() {
    const mapPath = `World\\maps\\${this.map}\\${this.map}.wdt`;
    const wdt = await this.wdtAssetProvider.start(mapPath);
    this._wdtSubject.next(wdt);
  }

  public dispose(): void {}
}
