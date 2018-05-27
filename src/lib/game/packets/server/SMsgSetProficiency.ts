
import { Serialize, UInt32Prop, UInt64Prop, UInt8Prop } from 'bawt/net/Serialization';
import { RegisterPacket, WorldPacketMap } from 'bawt/net/PacketMap';
import { ServerPacket } from './ServerPacket';
import { IFactory } from 'interface/IFactory';
import { IPacket } from 'interface/IPacket';
import * as Long from 'long';
import Opcode from '../../Opcode';

class Factory implements IFactory<IPacket> {
  public Create(...args: any[]) {
    return new SMsgSetProficiency();
  }
}

@RegisterPacket(WorldPacketMap, Opcode.SMSG_SET_PROFICIENCY, new Factory())
export class SMsgSetProficiency extends ServerPacket {
  constructor() {
    super(Opcode.SMSG_SET_PROFICIENCY);
  }

  @Serialize(UInt8Prop())
  public ItemClass: number = 0;

  @Serialize(UInt32Prop())
  public ItemSubclassMask: number = 0;
}
