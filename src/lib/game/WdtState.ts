import { lazyInject } from 'bawt/Container';
import { PlayerState, ILocation } from 'bawt/game/PlayerState';
import { LoadWDT } from 'bawt/worker/LoadWDT';
import * as WDT from 'blizzardry/lib/wdt';
import { IHttpService } from 'interface/IHttpService';
import { IObject } from 'interface/IObject';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { injectable } from 'inversify';

@injectable()
export class WdtState implements IObject {
  private mapSub: Subscription|null = null;
  private map: string = '';

  @lazyInject('Observable<ILocation>') private location!: Observable<ILocation>;
  @lazyInject('IHttpService') private httpService!: IHttpService;

  private _wdtSubject: BehaviorSubject<WDT.IWDT|null> = new BehaviorSubject<WDT.IWDT|null>(null);
  public get wdtSubject(): Observable<WDT.IWDT|null> {
    return this._wdtSubject;
  }

  public async initialize() {
    this.mapSub = this.location.subscribe({ next: this.onMapChanged });
  }

  public dispose(): void {
    this.mapSub!.unsubscribe();
  }

  private onMapChanged = async (location: ILocation) => {
    const mapChanged = this.map !== location.map;
    this.map = location.map;
    if (location.map === '') {
      return;
    }

    if (!mapChanged) {
      return;
    }

    const mapPath = `World\\maps\\${location.map}\\${location.map}.wdt`;
    const wdtLoader = new LoadWDT(this.httpService);
    const wdt = await wdtLoader.Start(mapPath);
    this._wdtSubject.next(wdt);
  }
}