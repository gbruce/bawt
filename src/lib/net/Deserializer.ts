import { EventList, IEvent } from 'strongly-typed-events';
import { DeserializeObjectFromBuffer, BufferLength } from '../net/Serialization';
import { IFactory } from '../../interface/IFactory';
import { ISerializable } from '../../interface/Serializable';
import { IPacket } from '../../interface/Packet';
import { ICrypt } from '../../interface/ICrypt';
import * as ByteBuffer from 'bytebuffer';
import { NewLogger } from '../utils/Logger';

const log = NewLogger('net/Deserializer');

export interface IHeaderDesc {
  headerBytes: number;
  opcode: number;
  packetBytes: number;
}

export interface IHeaderDeserializer {
  deserialize(buffer: Buffer, offset: number): IHeaderDesc;
  decrypt(buffer: Buffer, offset: number, crypt: ICrypt): void;
}

export const AuthHeaderDeserializer = {
  deserialize: (buffer: Buffer, offset: number): IHeaderDesc => {
    return {
      headerBytes: 1,
      opcode: buffer.readUInt8(0),
      packetBytes: buffer.length,
    };
  },
  decrypt: (buffer: Buffer, offset: number, crypt: ICrypt): void => {
    const header = buffer.subarray(0, 1);
    crypt.Decrypt(header, 1);
  },
};

export const GameHeaderDeserializer = {
  deserialize: (buffer: Buffer, offset: number): IHeaderDesc => {
    const size = buffer.readUInt16BE(offset) + 2;
    const opcode = buffer.readUInt16LE(offset + 2);
    return {
      headerBytes: 4,
      opcode,
      packetBytes: size,
    };
  },
  decrypt: (buffer: Buffer, offset: number, crypt: ICrypt): void => {
    const header = buffer.subarray(offset, offset + 4);
    crypt.Decrypt(header, 4);
  },
};

export class Deserializer {
  private events: EventList<Deserializer, IPacket> = new EventList<Deserializer, IPacket>();

  constructor(private headerDeserializer: IHeaderDeserializer, private map: Map<number, IFactory<IPacket>>) {}

  private _crypt: ICrypt|null = null;
  public set Encryption(crypt: ICrypt) {
    this._crypt = crypt;
  }

  public Deserialize(buffer: Buffer) {
    let offset = 0;
    while (offset < buffer.byteLength) {
      if (this._crypt) {
        this.headerDeserializer.decrypt(buffer, offset, this._crypt);
      }

      const headerDesc = this.headerDeserializer.deserialize(buffer, offset);
      log.info(`headerBytes:${headerDesc.headerBytes} opcode:0x${headerDesc.opcode.toString(16)}` +
        `packetBytes:${headerDesc.packetBytes}`);

      offset += headerDesc.packetBytes;

      const factory = this.map.get(headerDesc.opcode);
      if (!factory) {
        log.error(`Unknown opcode:0x${headerDesc.opcode.toString(16)}`);
        continue;
      }

      const obj = factory.Create(headerDesc.opcode);
      const byteBuffer = new ByteBuffer();
      const packet = buffer.subarray(headerDesc.headerBytes);
      byteBuffer.append(packet);
      byteBuffer.offset = 0;
      byteBuffer.LE();
      DeserializeObjectFromBuffer(obj, byteBuffer);

      log.info(`${headerDesc.packetBytes} bytes ==> ${obj.Name} buff:${BufferLength(obj)}`);

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
