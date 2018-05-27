import { Serialize, UInt8Prop, UInt16Prop, UInt32Prop, ByteArrayProp } from 'bawt/net/Serialization';
import { AuthPacket } from '../AuthPacket';
import { RegisterPacket, AuthPacketMap } from 'bawt/net/PacketMap';
import { IFactory } from 'interface/IFactory';
import { IPacket } from 'interface/IPacket';
import Opcode from '../../Opcode';

class Factory implements IFactory<IPacket> {
  public Create(...args: any[]) {
    return new SLogonProof();
  }
}

@RegisterPacket(AuthPacketMap, Opcode.LOGON_PROOF, new Factory())
export class SLogonProof extends AuthPacket {
  constructor() {
    super(Opcode.LOGON_PROOF);
  }

  @Serialize(UInt8Prop())
  public Unk1: number = 0;

  @Serialize(ByteArrayProp(() => 20))
  public M2: number[] = [];
}
