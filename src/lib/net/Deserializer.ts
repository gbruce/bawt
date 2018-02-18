import { EventList, IEvent } from 'strongly-typed-events';
import { DeserializeObjectFromBuffer, BufferLength } from '../net/Serialization';
import { Factory } from '../../interface/Factory';
import { Serializable } from '../../interface/Serializable';
import { Packet } from '../../interface/Packet';
import { Crypt } from '../../interface/Crypt';
import * as ByteBuffer from 'bytebuffer';
import { NewLogger } from '../utils/Logger';

const log = NewLogger('net/Deserializer');

export interface HeaderDesc {
  headerBytes: number;
  opcode: number;
  packetBytes?: number;
}

export interface HeaderDeserializer {
  deserialize(buffer: Buffer, offset: number): HeaderDesc;
  decrypt(buffer: Buffer, offset: number, crypt: Crypt): void;
}

export const AuthHeaderDeserializer = {
  deserialize: (buffer: Buffer, offset: number): HeaderDesc => {
    return {
      headerBytes: 1,
      opcode: buffer.readUInt8(0),
    };
  },
  decrypt: (buffer: Buffer, offset: number, crypt: Crypt): void => {
    const header = buffer.subarray(0, 1);
    crypt.Decrypt(header, 1);
  },
};

export const GameHeaderDeserializer = {
  deserialize: (buffer: Buffer, offset: number): HeaderDesc => {
    const size = buffer.readUInt16BE(offset) + 2;
    const opcode = buffer.readUInt16LE(offset + 2);
    return {
      headerBytes: 4,
      opcode,
      packetBytes: size,
    };
  },
  decrypt: (buffer: Buffer, offset: number, crypt: Crypt): void => {
    const header = buffer.subarray(offset, offset + 4);
    crypt.Decrypt(header, 4);
  },
};

export class Deserializer {
  private events: EventList<Deserializer, Packet> = new EventList<Deserializer, Packet>();

  constructor(private headerDeserializer: HeaderDeserializer, private map: Map<number, Factory<Packet>>) {}

  private _crypt: Crypt|null = null;
  public set Encryption(crypt: Crypt) {
    this._crypt = crypt;
  }

  public Deserialize(buffer: Buffer) {
    let offset = 0;
    while (offset < buffer.byteLength) {
      if (this._crypt) {
        this.headerDeserializer.decrypt(buffer, offset, this._crypt);
      }

      const headerDesc = this.headerDeserializer.deserialize(buffer, offset);
      if (headerDesc.packetBytes) {
        offset += headerDesc.packetBytes;
      }
      else {
        offset += buffer.length;
      }

      const factory = this.map.get(headerDesc.opcode);
      if (!factory) {
        log.warn('Unknown opcode: ', headerDesc.opcode);
        continue;
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
  }

  public OnObjectDeserialized(opcode: string): IEvent<Deserializer, any>
  {
    return this.events.get(opcode).asEvent();
  }
}
