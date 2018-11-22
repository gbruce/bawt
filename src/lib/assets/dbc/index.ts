import { IObject } from "interface/IObject";

export class DBC implements IObject {
  private _fields: string[]|null = null;

  public get numRecords() {
    return this.dbc.records.length;
  }

  constructor(private dbc: any, private dbcTypes: blizzardry.IEntity) {
  }

  public async initialize() {}
  public dispose() {}

  public as<T>(): T[] {
    return this.dbc.records as T[];
  }

  public get fields() {
    if (this._fields == null) {
      this._fields = Object.keys(this.dbcTypes.fields);
    }

    return this._fields;
  }

  get records(): any[] {
    return this.dbc.records;
  }
}
