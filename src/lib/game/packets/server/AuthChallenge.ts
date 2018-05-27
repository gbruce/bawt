
import { Serialize, UInt32Prop, ByteArrayProp } from 'bawt/net/Serialization';
import { RegisterPacket, WorldPacketMap } from 'bawt/net/PacketMap';
import { ServerPacket } from './ServerPacket';
import { IFactory } from 'interface/IFactory';
import { IPacket } from 'interface/IPacket';
import Opcode from '../../Opcode';

class Factory implements IFactory<IPacket> {
  public Create(...args: any[]) {
    return new SAuthChallenge();
  }
}

@RegisterPacket(WorldPacketMap, Opcode.SMSG_AUTH_CHALLENGE, new Factory())
export class SAuthChallenge extends ServerPacket {
  constructor() {
    super(Opcode.SMSG_AUTH_CHALLENGE);
  }

  @Serialize(UInt32Prop())
  public Unk1: number = 0;

  @Serialize(ByteArrayProp(() => 4))
  public Salt: number[] = [];

  @Serialize(ByteArrayProp(() => 16))
  public Seed1: number[] = [];

  @Serialize(ByteArrayProp(() => 16))
  public Seed2: number[] = [];
}
