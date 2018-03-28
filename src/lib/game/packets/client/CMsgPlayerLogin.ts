import * as ByteBuffer from 'bytebuffer';
import { Serialize, UInt64Prop, StringProp,
  StringNoNullProp, ByteArrayProp, ConstByteBufferProp } from 'bawt/net/Serialization';
import { ClientPacket } from './ClientPacket';
import { IFactory } from 'interface/IFactory';
import * as Long from 'long';
import Opcode from '../../Opcode';

export class CMsgPlayerLogin extends ClientPacket {
  constructor() {
    super(Opcode.CMSG_PLAYER_LOGIN);
  }

  @Serialize(UInt64Prop())
  public Guid: Long = new Long(0);
}
