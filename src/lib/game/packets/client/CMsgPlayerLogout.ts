import { ClientPacket } from './ClientPacket';
import Opcode from '../../Opcode';

export class CMsgPlayerLogout extends ClientPacket {
  constructor() {
    super(Opcode.CMSG_PLAYER_LOGOUT);
  }
}
