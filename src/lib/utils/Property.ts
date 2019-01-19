import { BehaviorSubject, Observable } from 'rxjs';

export class Property<T> {
  constructor(private defaultValue: T) {}

  private _id: number = 0;
  private _owner: BehaviorSubject<T>|null = null;
  public acquire = (owner: BehaviorSubject<T>) => {
    if (owner && !this._owner) {
      this._owner = owner;
      this._owner.subscribe({
        next: (x) => {
          this._subject.next(x);
        },
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
  public get observable(): Observable<T> {
    return this._subject;
  }
}
