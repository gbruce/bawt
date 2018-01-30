import { Serializable, Serialize, UInt8Prop, UInt16Prop, UInt32Prop, StringProp,
  StringNoNullProp, ByteArrayProp } from '../../../net/Serialization';
import { ClientPacket } from './ClientPacket';
import { Factory } from '../../../../interface/Factory';
import Opcode from '../../Opcode';

export class NewLogonProof implements Factory<Serializable> {
  public Create(...args: any[]) {
    return new LogonProof();
  }
}

export class LogonProof extends ClientPacket implements Serializable {
  constructor() {
    super(Opcode.LOGON_PROOF);
  }

  @Serialize(ByteArrayProp(() => 32))
  public A: number[] = [];

  @Serialize(ByteArrayProp(() => 20))
  public M1: number[] = [];

  @Serialize(ByteArrayProp(() => 20))
  public Crc: number[] = [];

  @Serialize(UInt8Prop())
  public NumberKeys: number;

  @Serialize(UInt8Prop())
  public Flags: number;
}
