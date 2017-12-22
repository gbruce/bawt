import { EventEmitter } from 'events';
import { Session } from '../../interface/Session';
import Character from './character';
import { default as GamePacket } from '../game/packet';
import GameOpcode from '../game/opcode';
import AuthPacket from '../auth/packet';
import { NewLogger } from '../utils/Logger';

const Log = NewLogger('game/Handler');

class CharacterHandler extends EventEmitter {
  public list: Character[] = [];
  private session: any;

  // Creates a new character handler
  constructor(session: any) {
    super();

    // Holds session
    this.session = session;

    // Listen for character list
    this.session.game.on('packet:receive:SMSG_CHAR_ENUM', (ap: AuthPacket) => {
      this.handleCharacterList(ap);
    });
  }

  // Requests a fresh list of characters
  public refresh() {
    Log.info('refreshing character list');

    const gp = new GamePacket(GameOpcode.CMSG_CHAR_ENUM);
    gp.writeUint8(GameOpcode.CMSG_CHAR_ENUM);

    return this.session.game.send(gp);
  }

  // Character list refresh handler (SMSG_CHAR_ENUM)
  private handleCharacterList(gp: AuthPacket) {
    const opcode = gp.readUint8();
    const count = gp.readUint8(); // number of characters
    this.list.length = 0;

    for (let i = 0; i < count; ++i) {
      const character = new Character();
      character.guid = gp.readGUID();
      character.name = gp.readCString();
      character.race = gp.readUint8();
      character.class = gp.readUint8();
      character.gender = gp.readUint8();
      character.bytes = gp.readUint32();
      character.facial = gp.readUint8();
      character.level = gp.readUint8();
      character.zone = gp.readUint32();
      character.map = gp.readUint32();
      character.x = gp.readFloat();
      character.y = gp.readFloat();
      character.z = gp.readFloat();
      character.guild = gp.readUint32();
      character.flags = gp.readUint32();

      gp.readUint32(); // character customization
      gp.readUint8(); // (?)

      const pet = {
        model: gp.readUint32(),
        level: gp.readUint32(),
        family: gp.readUint32(),
      };
      if (pet.model) {
        character.pet = pet;
      }

      character.equipment = [];
      for (let j = 0; j < 23; ++j) {
        const item = {
          model: gp.readUint32(),
          type: gp.readUint32(),
          enchantment: gp.readUint32(),
        };
        character.equipment.push(item);
      }

      this.list.push(character);
    }

    this.emit('refresh');
  }
}

export default CharacterHandler;
