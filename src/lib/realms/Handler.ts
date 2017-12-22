import { EventEmitter} from 'events';

import AuthOpcode from '../auth/Opcode';
import AuthPacket from '../auth/Packet';
import Realm from './Realm';
import { NewLogger } from '../utils/Logger';

const Log = NewLogger('RealmHandler');

class RealmsHandler extends EventEmitter {
  public list: Realm[];
  private session: any;

  // Creates a new realm handler
  constructor(session: any) {
    super();

    // Holds session
    this.session = session;

    // Initially empty list of realms
    this.list = [];

    // Listen for realm list
    this.session.auth.on('packet:receive:REALM_LIST', (ap: AuthPacket) => {
      this.handleRealmList(ap);
    });
  }

  // Requests a fresh list of realms
  public refresh() {
    Log.info('refreshing realmlist');

    const ap = new AuthPacket(AuthOpcode.REALM_LIST, 1 + 4);
    ap.writeUint8(AuthOpcode.REALM_LIST);
    // Per WoWDev, the opcode is followed by an unknown uint32
    ap.writeUint32(0x00);

    return this.session.auth.send(ap);
  }

  // Realm list refresh handler (REALM_LIST)
  private handleRealmList(ap: AuthPacket) {
    const opcode = ap.readUint8();
    const size = ap.readUint16();         // packet-size
    ap.readUint32();   // (?)

    const count = ap.readUint16(); // number of realms

    this.list.length = 0;

    for (let i = 0; i < count; ++i) {
      const realm = new Realm();

      realm.icon = ap.readUint8();
      realm.lock = ap.readUint8();
      realm.flags = ap.readUint8();
      realm.name = ap.readCString();
      realm.address = ap.readCString();
      realm.population = ap.readFloat();
      realm.characters = ap.readUint8();
      realm.timezone = ap.readUint8();
      realm.id = ap.readUint8();

      // TODO: Introduce magic constants such as REALM_FLAG_SPECIFYBUILD
      if (realm.flags & 0x04) {
        realm.majorVersion = ap.readUint8();
        realm.minorVersion = ap.readUint8();
        realm.patchVersion = ap.readUint8();
        realm.build = ap.readUint16();
      }

      this.list.push(realm);
    }

    this.emit('refresh');
  }

}

export default RealmsHandler;
