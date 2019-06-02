import { ClientPacket } from './ClientPacket';
import Opcode from '../../Opcode';

export class CMsgCharEnum extends ClientPacket {
  constructor() {
    super(Opcode.CMSG_CHAR_ENUM);
  }
}
