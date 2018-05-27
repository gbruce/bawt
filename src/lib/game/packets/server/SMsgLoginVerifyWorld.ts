
import { Serialize, UInt32Prop, Float32Prop } from 'bawt/net/Serialization';
import { RegisterPacket, WorldPacketMap } from 'bawt/net/PacketMap';
import { ServerPacket } from './ServerPacket';
import { IFactory } from 'interface/IFactory';
import { IPacket } from 'interface/IPacket';
import Opcode from '../../Opcode';

class Factory implements IFactory<IPacket> {
  public Create(...args: any[]) {
    return new SMsgLoginVerifyWorld();
  }
}

@RegisterPacket(WorldPacketMap, Opcode.SMSG_LOGIN_VERIFY_WORLD, new Factory())
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
