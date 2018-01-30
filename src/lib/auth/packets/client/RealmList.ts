import { Serialize, UInt32Prop } from '../../../net/Serialization';
import { ClientPacket } from './ClientPacket';
import Opcode from '../../Opcode';

export class RealmList extends ClientPacket {
  constructor() {
    super(Opcode.REALM_LIST);
  }

  @Serialize(UInt32Prop())
  public Unk1: number = 0;
}
