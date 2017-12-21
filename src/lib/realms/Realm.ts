class Realm {
  public _host: string = '';
  public _port: number = NaN;
  public _address: string = '';
  public name: string = '';
  public id: any;
  public icon: any;
  public lock: any;
  public flags: any;
  public timezone: any;
  public population: number;
  public characters: number;
  public majorVersion: any;
  public minorVersion: any;
  public patchVersion: any;
  public build: any;

  // Creates a new realm
  constructor() {
    // Holds realm attributes
    this.id = null;
    this.icon = null;
    this.flags = null;
    this.timezone = null;
    this.population = 0.0;
    this.characters = 0;

    this.majorVersion = null;
    this.minorVersion = null;
    this.patchVersion = null;
    this.build = null;
  }

  // Short string representation of this realm
  toString() {
    return `[Realm; Name: ${this.name}; Address: ${this._address}; Characters: ${this.characters}]`;
  }

  // Retrieves host for this realm
  public get host() {
    return this._host;
  }

  // Retrieves port for this realm
  get port() {
    return this._port;
  }

  // Retrieves address for this realm
  get address() {
    return this._address;
  }

  // Sets address for this realm
  set address(address: string) {
    this._address = address;
    const parts = this._address.split(':');
    this._host = parts[0];
    this._port = parseInt(parts[1]);
  }

}

export default Realm;
