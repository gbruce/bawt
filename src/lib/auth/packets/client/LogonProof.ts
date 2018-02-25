import { Serialize, UInt8Prop, UInt16Prop, UInt32Prop, StringProp,
  StringNoNullProp, ByteArrayProp } from '../../../net/Serialization';
import { AuthPacket } from '../AuthPacket';
import { IFactory } from '../../../../interface/Factory';
import Opcode from '../../Opcode';

export class LogonProof extends AuthPacket {
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
  public NumberKeys: number = 0;

  @Serialize(UInt8Prop())
  public Flags: number = 0;
}
