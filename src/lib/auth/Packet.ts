import AuthOpcode from './Opcode';
import { default as BasePacket } from '../net/Packet';
import { default as ObjectUtil } from '../utils/ObjectUtil';

class AuthPacket extends BasePacket {

  // Header size in bytes for both incoming and outgoing packets
  static HEADER_SIZE = 1;

  constructor(opcode: any, source: any, outgoing = true) {
    super(opcode, source || AuthPacket.HEADER_SIZE, outgoing);
    this.name = ObjectUtil.KeyByValue(AuthOpcode, this.opcode);
  }

  // Finalizes this packet
  finalize() {
    // ===this.index = 0;
    //this.writeByte(this.opcode);
  }

}

export default AuthPacket;
