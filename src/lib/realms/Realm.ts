class Realm {
  public myHost: string = '';
  public myPort: number = NaN;
  public myAddress: string = '';
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
  public toString() {
    return `[Realm; Name: ${this.name}; Address: ${this.myAddress}; Characters: ${this.characters}]`;
  }

  // Retrieves host for this realm
  public get host() {
    return this.myHost;
  }

  // Retrieves port for this realm
  get port() {
    return this.myPort;
  }

  // Retrieves address for this realm
  get address() {
    return this.myAddress;
  }

  // Sets address for this realm
  set address(address: string) {
    this.myAddress = address;
    const parts = this.myAddress.split(':');
    this.myHost = parts[0];
    this.myPort = parseInt(parts[1], 10);
  }
}

export default Realm;
