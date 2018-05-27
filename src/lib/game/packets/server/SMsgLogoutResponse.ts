import { Serialize, UInt8Prop, UInt32Prop } from 'bawt/net/Serialization';
import { RegisterPacket, WorldPacketMap } from 'bawt/net/PacketMap';
import { ServerPacket } from './ServerPacket';
import { IFactory } from 'interface/IFactory';
import { IPacket } from 'interface/IPacket';
import Opcode from '../../Opcode';

class Factory implements IFactory<IPacket> {
  public Create(...args: any[]) {
    return new SMsgLogoutResponse();
  }
}

@RegisterPacket(WorldPacketMap, Opcode.SMSG_LOGOUT_RESPONSE, new Factory())
export class SMsgLogoutResponse extends ServerPacket {
  constructor() {
    super(Opcode.SMSG_LOGOUT_RESPONSE);
  }

  @Serialize(UInt32Prop())
  public Reason: number = 0;

  @Serialize(UInt8Prop())
  public Result: number = 0;
}
