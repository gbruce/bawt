import { ClientPacket } from './ClientPacket';
import Opcode from '../../Opcode';

export class CMsgLogoutRequest extends ClientPacket {
  constructor() {
    super(Opcode.CMSG_LOGOUT_REQUEST);
  }
}
