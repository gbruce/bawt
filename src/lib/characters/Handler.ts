import { EventEmitter } from 'events';
import { Session } from '../../interface/Session';
import Character from './Character';
import { default as GamePacket } from '../game/Packet';
import GameOpcode from '../game/Opcode';
import { NewLogger } from '../utils/Logger';

const Log = NewLogger('game/Handler');

enum AtLoginFlags {
  AT_LOGIN_NONE              = 0x000,
  AT_LOGIN_RENAME            = 0x001,
  AT_LOGIN_RESET_SPELLS      = 0x002,
  AT_LOGIN_RESET_TALENTS     = 0x004,
  AT_LOGIN_CUSTOMIZE         = 0x008,
  AT_LOGIN_RESET_PET_TALENTS = 0x010,
  AT_LOGIN_FIRST             = 0x020,
  AT_LOGIN_CHANGE_FACTION    = 0x040,
  AT_LOGIN_CHANGE_RACE       = 0x080,
  AT_LOGIN_RESURRECT         = 0x100,
}

enum InventorySlots {
  INVENTORY_SLOT_BAG_START    = 19,
  INVENTORY_SLOT_BAG_END      = 23,
}

class CharacterHandler extends EventEmitter {
  public list: Character[] = [];
  private session: any;

  // Creates a new character handler
  constructor(session: any) {
    super();

    // Holds session
    this.session = session;

    // Listen for character list
    this.session.game.on('packet:receive:SMSG_CHAR_ENUM', (ap: GamePacket) => {
      this.list = HandleCharacterList(ap);
      this.emit('refresh');
    });
  }

  // Requests a fresh list of characters
  public refresh() {
    Log.info('refreshing character list');

    const gp = new GamePacket(GameOpcode.CMSG_CHAR_ENUM);
    return this.session.game.send(gp);
  }
}

// Character list refresh handler (SMSG_CHAR_ENUM)
export function HandleCharacterList(gp: GamePacket): Character[] {
  const list: Character[] = [];
  gp.readUint16(); // size
  gp.readUint16(); // opcode
  const count = gp.readUint8(); // number of characters

  for (let i = 0; i < count; ++i) {
    const character = new Character();
    character.guid = gp.readGUID();
    character.name = gp.readCString();
    character.race = gp.readUint8();
    character.class = gp.readUint8();
    character.gender = gp.readUint8();
    gp.readUint8(); // skin
    gp.readUint8(); // face
    gp.readUint8(); // hairStyle
    gp.readUint8(); // hairColor
    character.facial = gp.readUint8(); // facialStyle
    character.level = gp.readUint8();
    character.zone = gp.readUint32();
    character.map = gp.readUint32();
    character.x = gp.readFloat();
    character.y = gp.readFloat();
    character.z = gp.readFloat();
    character.guild = gp.readUint32();
    character.flags = gp.readUint32();

    gp.readUint32(); // at login flags
    gp.readUint8(); // first login

    gp.readUint32(); // pet display id
    gp.readUint32(); // pet level
    gp.readUint32(); // pet family

    for (let s = 0; s < InventorySlots.INVENTORY_SLOT_BAG_END; s++) {
      gp.readUint32(); // display info id
      gp.readUint8(); // inventory type
      gp.readUint32(); // aura id
    }

    list.push(character);
  }

  return list;
}

export default CharacterHandler;
