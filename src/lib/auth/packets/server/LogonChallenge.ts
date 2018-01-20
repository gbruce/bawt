import { Serialize, UInt8Prop, UInt16Prop, UInt32Prop, ByteArrayProp } from '../../../net/Serialization';
import { ServerPacket } from './ServerPacket';
import Opcode from '../../Opcode';

export class LogonChallenge extends ServerPacket {
  constructor() {
    super(Opcode.LOGON_CHALLENGE);
  }

  @Serialize(UInt8Prop())
  public readonly Unk1: number;

  @Serialize(UInt8Prop())
  public readonly Status: number;

  @Serialize(ByteArrayProp(() => 32))
  public readonly B: number[];

  @Serialize(UInt8Prop())
  public readonly GLength: number;

  @Serialize(ByteArrayProp((target: LogonChallenge) => target.GLength))
  public readonly G: number[];

  @Serialize(UInt8Prop())
  public readonly NLength: number;

  @Serialize(ByteArrayProp((target: LogonChallenge) => target.NLength))
  public readonly N: number[];

  @Serialize(ByteArrayProp(() => 32))
  public readonly Salt: number[];
}
