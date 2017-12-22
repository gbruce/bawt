import AuthOpcode from './Opcode';
import { default as BasePacket } from '../net/Packet';
import { default as ObjectUtil } from '../utils/ObjectUtil';

class AuthPacket extends BasePacket {

  // Header size in bytes for both incoming and outgoing packets
  public static HEADER_SIZE = 1;

  constructor(opcode: any, source: any, outgoing = true) {
    super(opcode, source || AuthPacket.HEADER_SIZE, outgoing);
    this.name = ObjectUtil.KeyByValue(AuthOpcode, this.opcode);
  }

  // Finalizes this packet
  public finalize() {}
}

export default AuthPacket;
