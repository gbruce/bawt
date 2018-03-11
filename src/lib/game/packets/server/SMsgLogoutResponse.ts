import { Serialize, UInt8Prop, UInt32Prop } from '../../../net/Serialization';
import { ServerPacket } from './ServerPacket';
import { IFactory } from '../../../../interface/IFactory';
import { IPacket } from '../../../../interface/IPacket';
import Opcode from '../../Opcode';

export class NewSMsgLogoutResponse implements IFactory<IPacket> {
  public Create(...args: any[]) {
    return new SMsgLogoutResponse();
  }
}

export class SMsgLogoutResponse extends ServerPacket {
  constructor() {
    super(Opcode.SMSG_LOGOUT_RESPONSE);
  }

  @Serialize(UInt32Prop())
  public Reason: number = 0;

  @Serialize(UInt8Prop())
  public Result: number = 0;
}
