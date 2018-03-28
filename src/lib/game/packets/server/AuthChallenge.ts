
import { Serialize, UInt8Prop, UInt16Prop, UInt32Prop, ByteArrayProp } from 'bawt/net/Serialization';
import { ServerPacket } from './ServerPacket';
import { IFactory } from 'interface/IFactory';
import { IPacket } from 'interface/IPacket';
import Opcode from '../../Opcode';

export class NewSAuthChallenge implements IFactory<IPacket> {
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
