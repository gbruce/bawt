import { Serialize, UInt32Prop } from 'bawt/net/Serialization';
import { AuthPacket } from '../AuthPacket';
import Opcode from '../../Opcode';

export class RealmList extends AuthPacket {
  constructor() {
    super(Opcode.REALM_LIST);
  }

  @Serialize(UInt32Prop())
  public Unk1: number = 0;
}
