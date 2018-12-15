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

  @lazyInject('PlayerState') private player!: PlayerState;
  @lazyInject('IHttpService') private httpService!: IHttpService;

  private _wdtSubject: BehaviorSubject<WDT.IWDT|null> = new BehaviorSubject<WDT.IWDT|null>(null);
  public get wdtSubject(): Observable<WDT.IWDT|null> {
    return this._wdtSubject;
  }

  public async initialize() {
    this.mapSub = this.player.location.subject.subscribe({ next: this.onMapChanged });
  }

  public dispose(): void {
    this.mapSub!.unsubscribe();
  }

  private onMapChanged = async (location: ILocation) => {
    const mapPath = `World\\maps\\${location.map}\\${location.map}.wdt`;
    const wdtLoader = new LoadWDT(this.httpService);
    const wdt = await wdtLoader.Start(mapPath);
    this._wdtSubject.next(wdt);
  }
}
