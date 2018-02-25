import { SimpleEventDispatcher, ISimpleEvent } from 'strongly-typed-events';
import { SerializeObjectToBuffer, BufferLength } from '../net/Serialization';
import { IPacket } from '../../interface/Packet';
import { Crypt } from '../../interface/Crypt';
import * as ByteBuffer from 'bytebuffer';
import { NewLogger } from '../utils/Logger';

const log = NewLogger('net/Serializer');

const readIntoByteArray = (bytes: number, bb: ByteBuffer) => {
  const result = [];
  for (let i = 0; i < bytes; i++) {
    result.push(bb.readUint8());
  }
  return result;
};

export interface HeaderSerializer {
  bytes: number;
  serialize(opcode: number, buffer: ByteBuffer, crypt: Crypt|null): void;
}

export const AuthHeaderSerializer = {
  bytes: 1,
  serialize: (opcode: number, buffer: ByteBuffer, crypt: Crypt|null) => {
    buffer.writeUint8(opcode);
  },
};

export const GameHeaderSerializer = {
  bytes: 6,
  serialize: (opcode: number, buffer: ByteBuffer, crypt: Crypt|null) => {
    buffer.BE().writeUint16(buffer.capacity() - 2);
    buffer.LE().writeUint32(opcode);

    if (crypt) {
      buffer.offset = 0;
      const array = readIntoByteArray(6, buffer);
      crypt.Encrypt(array, array.length);
      buffer.offset = 0;
      buffer.writeUint8(array[0]);
      buffer.writeUint8(array[1]);
      buffer.writeUint8(array[2]);
      buffer.writeUint8(array[3]);
      buffer.writeUint8(array[4]);
      buffer.writeUint8(array[5]);
    }
  },
};

export class Serializer {
  private event: SimpleEventDispatcher<ArrayBuffer> = new SimpleEventDispatcher<ArrayBuffer>();

  constructor(private headerSerializer: HeaderSerializer) {}

  private _crypt: Crypt|null = null;
  public set Encryption(crypt: Crypt) {
    this._crypt = crypt;
  }

  public Serialize(packet: IPacket) {
    const buffLength = this.headerSerializer.bytes + BufferLength(packet);

    const b = new ByteBuffer(buffLength).LE();
    this.headerSerializer.serialize(packet.Opcode, b, this._crypt);
    SerializeObjectToBuffer(packet, b);

    log.info(`${packet.Name} ==> ${buffLength} bytes`);
    this.event.dispatch(b.buffer);
  }

  public get OnPacketSerialized(): ISimpleEvent<ArrayBuffer>
  {
    return this.event.asEvent();
  }
}
