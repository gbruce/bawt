import { Serialize, UInt8Prop, UInt16Prop, UInt32Prop, ByteArrayProp } from '../../../net/Serialization';
import { AuthPacket } from '../AuthPacket';
import { Factory } from '../../../../interface/Factory';
import { Packet } from '../../../../interface/Packet';
import Opcode from '../../Opcode';

export class NewLogonProof implements Factory<Packet> {
  public Create(...args: any[]) {
    return new SLogonProof();
  }
}

export class SLogonProof extends AuthPacket {
  constructor() {
    super(Opcode.LOGON_PROOF);
  }

  @Serialize(UInt8Prop())
  public Unk1: number = 0;

  @Serialize(ByteArrayProp(() => 20))
  public M2: number[] = [];
}
