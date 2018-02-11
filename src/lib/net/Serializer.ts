import { SimpleEventDispatcher, ISimpleEvent } from 'strongly-typed-events';
import { SerializeObjectToBuffer, BufferLength } from '../net/Serialization';
import { Packet } from '../../interface/Packet';
import * as ByteBuffer from 'bytebuffer';
import { NewLogger } from '../utils/Logger';

const log = NewLogger('net/Serializer');

export interface HeaderSerializer {
  bytes: number;
  serialize(opcode: number, buffer: ByteBuffer): void;
}

export const AuthHeaderSerializer = {
  bytes: 1,
  serialize: (opcode: number, buffer: ByteBuffer) => {
    buffer.writeUint8(opcode);
  },
};

export const GameHeaderSerializer = {
  bytes: 6,
  serialize: (opcode: number, buffer: ByteBuffer) => {
    buffer.writeUint16(0);
    buffer.writeUint32(opcode);
  },
};

export class Serializer {
  private event: SimpleEventDispatcher<ArrayBuffer> = new SimpleEventDispatcher<ArrayBuffer>();

  constructor(private headerSerializer: HeaderSerializer) {}

  public Serialize(packet: Packet) {
    const buffLength = this.headerSerializer.bytes + BufferLength(packet);

    const b = new ByteBuffer(buffLength).LE();
    this.headerSerializer.serialize(packet.Opcode, b);
    SerializeObjectToBuffer(packet, b);

    log.info(`${packet.Name} ==> ${buffLength} bytes`);
    this.event.dispatch(b.buffer);
  }

  public get OnPacketSerialized(): ISimpleEvent<ArrayBuffer>
  {
    return this.event.asEvent();
  }
}
