
import { Serialize, UInt8Prop } from '../../../net/Serialization';
import { ServerPacket } from './ServerPacket';
import { Factory } from '../../../../interface/Factory';
import { Packet } from '../../../../interface/Packet';
import Opcode from '../../Opcode';

export class NewSAuthResponse implements Factory<Packet> {
  public Create(...args: any[]) {
    return new SAuthResponse();
  }
}

export class SAuthResponse extends ServerPacket {
  constructor() {
    super(Opcode.SMSG_AUTH_RESPONSE);
  }

  @Serialize(UInt8Prop())
  public Result: number = 0;
}