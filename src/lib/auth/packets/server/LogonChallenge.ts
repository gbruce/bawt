import { Serialize, UInt8Prop, UInt16Prop, UInt32Prop, ByteArrayProp } from 'bawt/net/Serialization';
import { AuthPacket } from '../AuthPacket';
import { RegisterPacket, PacketFactory, AuthPacketMap } from 'bawt/net/PacketMap';
import { IFactory } from 'interface/IFactory';
import { IPacket } from 'interface/IPacket';
import Opcode from '../../Opcode';

class Factory implements IFactory<IPacket> {
  public Create(...args: any[]) {
    return new SLogonChallenge();
  }
}

@RegisterPacket(AuthPacketMap, Opcode.LOGON_CHALLENGE, new Factory())
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
