import { EventList, IEvent } from 'strongly-typed-events';
import { DeserializeObjectFromBuffer, BufferLength } from '../net/Serialization';
import { Factory } from '../../interface/Factory';
import { Serializable } from '../../interface/Serializable';
import { Packet } from '../../interface/Packet';
import * as ByteBuffer from 'bytebuffer';
import { NewLogger } from '../utils/Logger';

const log = NewLogger('net/Deserializer');

export interface HeaderDesc {
  headerBytes: number;
  opcode: number;
  packetBytes?: number;
}

export interface HeaderDeserializer {
  deserialize(buffer: Buffer): HeaderDesc;
}

export const AuthHeaderDeserializer = {
  deserialize: (buffer: Buffer): HeaderDesc => {
    return {
      headerBytes: 1,
      opcode: buffer.readUInt8(0),
    };
  },
};

export const GameHeaderDeserializer = {
  deserialize: (buffer: Buffer): HeaderDesc => {
    const size = buffer.readUInt16BE(0) + 2;
    const opcode = buffer.readUInt16LE(0 + 2);
    return {
      headerBytes: 4,
      opcode,
      packetBytes: size,
    };
  },
};

export class Deserializer {
  private events: EventList<Deserializer, Packet> = new EventList<Deserializer, Packet>();

  constructor(private headerDeserializer: HeaderDeserializer, private map: Map<number, Factory<Packet>>) {}

  public Deserialize(buffer: Buffer) {
    const headerDesc = this.headerDeserializer.deserialize(buffer);
    const factory = this.map.get(headerDesc.opcode);
    if (!factory) {
      log.error('Unknown opcode: ', headerDesc.opcode);
      return;
    }

    const obj = factory.Create();
    const byteBuffer = new ByteBuffer();
    const packet = buffer.subarray(headerDesc.headerBytes);
    byteBuffer.append(packet);
    byteBuffer.offset = 0;
    DeserializeObjectFromBuffer(obj, byteBuffer);

    log.info(`${buffer.byteLength} bytes ==> ${obj.Name}`);

    if (obj) {
      this.events.get(headerDesc.opcode.toString()).dispatch(this, obj);
    }
  }

  public OnObjectDeserialized(opcode: string): IEvent<Deserializer, any>
  {
    return this.events.get(opcode).asEvent();
  }
}
