
import { Serialize, UInt8Prop, UInt16Prop, UInt32Prop, ByteArrayProp } from '../../../net/Serialization';
import { ServerPacket } from './ServerPacket';
import { Factory } from '../../../../interface/Factory';
import { Packet } from '../../../../interface/Packet';
import Opcode from '../../Opcode';

export class NewSAuthChallenge implements Factory<Packet> {
  public Create(...args: any[]) {
    return new SAuthChallenge();
  }
}

export class SAuthChallenge extends ServerPacket {
  constructor() {
    super(Opcode.SMSG_AUTH_CHALLENGE);
  }

  @Serialize(ByteArrayProp(() => 4))
  public Salt: number[] = [];
}
