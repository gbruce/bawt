import * as ByteBuffer from 'bytebuffer';
import { inject, injectable } from 'inversify';
import { ISimpleEvent, SimpleEventDispatcher } from 'strongly-typed-events';

import { ICrypt } from '../../interface/ICrypt';
import { IPacket } from '../../interface/IPacket';
import { ISerializer } from '../../interface/ISerializer';
import { BufferLength, SerializeObjectToBuffer } from '../net/Serialization';
import { NewLogger } from '../utils/Logger';

const log = NewLogger('net/Serializer');

const readIntoByteArray = (bytes: number, bb: ByteBuffer) => {
  const result = [];
  for (let i = 0; i < bytes; i++) {
    result.push(bb.readUint8());
  }
  return result;
};

type serializeFunc = (opcode: number, buffer: ByteBuffer, crypt: ICrypt|null) => void;

export interface IHeaderSerializer {
  bytes: number;
  serialize: serializeFunc;
}

@injectable()
export class AuthHeaderSerializer implements IHeaderSerializer {
  bytes: number = 1;
  serialize: serializeFunc = (opcode: number, buffer: ByteBuffer, crypt: ICrypt|null) => {
    buffer.writeUint8(opcode);
  };
}

@injectable()
export class GameHeaderSerializer implements IHeaderSerializer {
  bytes: number = 6;
  serialize: serializeFunc = (opcode: number, buffer: ByteBuffer, crypt: ICrypt|null) => {
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
  };
}

@injectable()
export class Serializer implements ISerializer {
  private event: SimpleEventDispatcher<ArrayBuffer> = new SimpleEventDispatcher<ArrayBuffer>();

  constructor(@inject('IHeaderSerializer') private headerSerializer: IHeaderSerializer) {}

  private _crypt: ICrypt|null = null;
  public set Encryption(crypt: ICrypt) {
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
