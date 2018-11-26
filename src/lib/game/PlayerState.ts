import { MakeVector3 } from 'bawt/utils/Math';
import { IObject } from 'interface/IObject';
import { IVector3 } from 'interface/IVector3';
import { injectable } from 'inversify';
import { BehaviorSubject } from 'rxjs';

@injectable()
export class PlayerState implements IObject {
  public initialize = async () => {}
  public dispose = (): void => {}
  
  private _source: BehaviorSubject<IVector3>|null = null;
  public set source(source: BehaviorSubject<IVector3>) {
    if (source && !this._source) {
      this._source = source;
      this._source.subscribe({
        next: (x) => {
          this._position.next(x);
        }
      });
    }
    else if (!source && this._source) {
      this._source.unsubscribe();
      this._source = null;
    }
  }

  private _position: BehaviorSubject<IVector3> = new BehaviorSubject<IVector3>(MakeVector3(0,0, 0));
  public get position(): BehaviorSubject<IVector3> {
    return this._position;
  }
}
