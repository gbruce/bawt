import { Serialize, UInt8Prop, UInt16Prop, UInt32Prop, ByteArrayProp } from '../../../net/Serialization';
import { AuthPacket } from '../AuthPacket';
import { Factory } from '../../../../interface/Factory';
import { IPacket } from '../../../../interface/Packet';
import Opcode from '../../Opcode';

export class NewLogonChallenge implements Factory<IPacket> {
  public Create(...args: any[]) {
    return new SLogonChallenge();
  }
}

export class SLogonChallenge extends AuthPacket {
  constructor() {
    super(Opcode.LOGON_CHALLENGE);
  }

  @Serialize(UInt8Prop())
  public Unk1: number = 0;

  @Serialize(UInt8Prop())
  public Status: number = 0;

  @Serialize(ByteArrayProp(() => 32))
  public B: number[] = [];

  @Serialize(UInt8Prop())
  public GLength: number = 0;

  @Serialize(ByteArrayProp((target: SLogonChallenge) => target.GLength))
  public G: number[] = [];

  @Serialize(UInt8Prop())
  public NLength: number = 0;

  @Serialize(ByteArrayProp((target: SLogonChallenge) => target.NLength))
  public N: number[] = [];

  @Serialize(ByteArrayProp(() => 32))
  public Salt: number[] = [];
}
