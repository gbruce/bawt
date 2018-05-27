
import { Serialize, UInt8Prop } from 'bawt/net/Serialization';
import { RegisterPacket, WorldPacketMap } from 'bawt/net/PacketMap';
import { ServerPacket } from './ServerPacket';
import { IFactory } from 'interface/IFactory';
import { IPacket } from 'interface/IPacket';
import Opcode from '../../Opcode';

class Factory implements IFactory<IPacket> {
  public Create(...args: any[]) {
    return new SAuthResponse();
  }
}

@RegisterPacket(WorldPacketMap, Opcode.SMSG_AUTH_RESPONSE, new Factory())
export class SAuthResponse extends ServerPacket {
  constructor() {
    super(Opcode.SMSG_AUTH_RESPONSE);
  }

  @Serialize(UInt8Prop())
  public Result: number = 0;
}
