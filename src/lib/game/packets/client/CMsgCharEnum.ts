import * as ByteBuffer from 'bytebuffer';
import { Serialize, UInt8Prop, UInt16Prop, UInt32Prop, StringProp,
  StringNoNullProp, ByteArrayProp, ConstByteBufferProp } from 'bawt/net/Serialization';
import { ClientPacket } from './ClientPacket';
import { IFactory } from 'interface/IFactory';
import Opcode from '../../Opcode';

export class CMsgCharEnum extends ClientPacket {
  constructor() {
    super(Opcode.CMSG_CHAR_ENUM);
  }
}
