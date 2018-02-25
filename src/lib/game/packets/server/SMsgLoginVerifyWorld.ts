
import { Serialize, UInt32Prop, Float32Prop } from '../../../net/Serialization';
import { ServerPacket } from './ServerPacket';
import { Factory } from '../../../../interface/Factory';
import { IPacket } from '../../../../interface/Packet';
import Opcode from '../../Opcode';

export class NewSMsgLoginVerifyWorld implements Factory<IPacket> {
  public Create(...args: any[]) {
    return new SMsgLoginVerifyWorld();
  }
}

export class SMsgLoginVerifyWorld extends ServerPacket {
  constructor() {
    super(Opcode.SMSG_LOGIN_VERIFY_WORLD);
  }

  @Serialize(UInt32Prop())
  public Map: number = 0;

  @Serialize(Float32Prop())
  public X: number = 0;

  @Serialize(Float32Prop())
  public Y: number = 0;

  @Serialize(Float32Prop())
  public Z: number = 0;

  @Serialize(Float32Prop())
  public Orientation: number = 0;
}
