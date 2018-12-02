import { MakeVector3 } from 'bawt/utils/Math';
import { IObject } from 'interface/IObject';
import { IVector3 } from 'interface/IVector3';
import { injectable } from 'inversify';
import { BehaviorSubject } from 'rxjs';

class Property<T> {
  constructor(private defaultValue: T) {}

  private _id: number = 0;
  private _owner: BehaviorSubject<T>|null = null;
  public acquire = (owner: BehaviorSubject<T>) => {
    if (owner && !this._owner) {
      this._owner = owner;
      this._owner.subscribe({
        next: (x) => {
          this._subject.next(x);
        }
      });
      this._id++;
      return this._id;
    }
    return null;
  }

  public release = (token: number) => {
    if (token === this._id && this._owner) {
      this._owner.unsubscribe();
      this._owner = null;
    }
  }

  private _subject: BehaviorSubject<T> = new BehaviorSubject<T>(this.defaultValue);
  public get subject(): BehaviorSubject<T> {
    return this._subject;
  }
}

@injectable()
export class PlayerState implements IObject {
  public initialize = async () => {}
  public dispose = (): void => {}

  public position: Property<IVector3> = new Property(MakeVector3(0,0, 0));
  public map: Property<string> = new Property('');
}
