import { NewLogger } from '../utils/Logger';
import { ISerializable } from '../../interface/ISerializable';
import * as ByteBuffer from 'bytebuffer';
import 'reflect-metadata';

const Log = NewLogger('net/Socket');

const SerializationIdentifier = 'serialization';
const DeserializeCallbackId = 'serialization:callback';

export type SerializeFunc = (target: any, value: any, buffer: ByteBuffer) => void;
export type DeserializeFunc = (target: any, buffer: ByteBuffer) => any;
export type SizeFunc = (target: any, value: any) => number;

interface ISerialization {
  serialize: SerializeFunc;
  deserialize: DeserializeFunc;
  size: SizeFunc;
}

export const UInt8Prop = (): ISerialization => {
  return {
    serialize: (target: any, value: any, buffer: ByteBuffer) => buffer.writeUint8(value),
    deserialize: (target: any, buffer: ByteBuffer): number => buffer.readUint8(),
    size: (target: any, value: any): number => 1,
  };
};

export const UInt16Prop = (bigEndian: boolean = false): ISerialization => {
  return {
    serialize: (target: any, value: any, buffer: ByteBuffer) => buffer.BE(bigEndian).writeUint16(value),
    deserialize: (target: any, buffer: ByteBuffer): number => buffer.BE(bigEndian).readUint16(),
    size: (target: any, value: any): number => 2,
  };
};

export const UInt32Prop = (): ISerialization => {
  return {
    serialize: (target: any, value: any, buffer: ByteBuffer) => buffer.writeUint32(value),
    deserialize: (target: any, buffer: ByteBuffer): number => buffer.readUint32(),
    size: (target: any, value: any): number => 4,
  };
};

export const UInt64Prop = (): ISerialization => {
  return {
    serialize: (target: any, value: any, buffer: ByteBuffer) => buffer.writeUint64(value),
    deserialize: (target: any, buffer: ByteBuffer): Long => buffer.readUint64(),
    size: (target: any, value: any): number => 8,
  };
};

export const StringProp = (): ISerialization => {
  return {
    serialize: (target: any, value: any, buffer: ByteBuffer) => buffer.writeCString(value),
    deserialize: (target: any, buffer: ByteBuffer): string => buffer.readCString(),
    size: (target: any, value: any): number => value.length + 1,
  };
};

export const StringNoNullProp = (): ISerialization => {
  return {
    serialize: (target: any, value: any, buffer: ByteBuffer) => (buffer as any).writeString(value),
    deserialize: (target: any, buffer: ByteBuffer): string => { throw new Error('Not implemented'); },
    size: (target: any, value: any): number => value.length,
  };
};

export const ByteArrayProp = (sizeFunc: (target: any) => number): ISerialization => {
  return {
    serialize: (target: any, value: any, buffer: ByteBuffer) => buffer.append(value),
    deserialize: (target: any, buffer: ByteBuffer): number[] => {
      const result = [];
      const sz = sizeFunc(target);
      for (let i = 0; i < sz; i++) {
        result.push(buffer.readUint8());
      }
      return result;
    },
    size: (target: any, value: any): number => sizeFunc(target),
  };
};

export const ConstByteBufferProp = (): ISerialization => {
  return {
    serialize: (target: any, value: any, buffer: ByteBuffer) => buffer.append(value),
    deserialize: (target: any, buffer: ByteBuffer): ByteBuffer => {
      const newBuff = new ByteBuffer();
      newBuff.append(buffer);
      return newBuff;
    },
    size: (target: any, value: any): number => (value as ByteBuffer).capacity(),
  };
};

export const Float32Prop = (): ISerialization => {
  return {
    serialize: (target: any, value: any, buffer: ByteBuffer) => buffer.writeFloat32(value),
    deserialize: (target: any, buffer: ByteBuffer): number => buffer.readFloat32(),
    size: (target: any, value: any): number => 4,
  };
};

export const ArrayProp = (sizeFunc: (target: any) => number,
                          factoryFunc: () => any): ISerialization => {
  return {
    serialize: (target: any, value: any, buffer: ByteBuffer) => {
      const array = value as any[];
      for (const item of array) {
        SerializeObjectToBuffer(item, buffer);
      }
    },
    deserialize: (target: any, buffer: ByteBuffer): any[] => {
      const result = [];
      const sz = sizeFunc(target);
      for (let i = 0; i < sz; i++) {
        const obj = factoryFunc();
        DeserializeObjectFromBuffer(obj, buffer);
        result.push(obj);
      }
      return result;
    },
    size: (target: any, value: any): number => sizeFunc(target),
  };
};

export function Serialize(serializer: ISerialization): (target: any, propertyKey: string) => void {
  return (target: any, propertyKey: string) => {
      Reflect.defineMetadata(SerializationIdentifier, serializer, target, propertyKey);
  };
}

export function SerializeObjectToBuffer(target: ISerializable, buffer: ByteBuffer) {
  const keys = Reflect.ownKeys(target);
  for (const key of keys) {
    const serialization = Reflect.getMetadata(SerializationIdentifier, target,
      key.toString()) as ISerialization;
    if (serialization) {
      const value = Reflect.get(target, key.toString());
      serialization.serialize(target, value, buffer);
    }
  }

  if (target.OnSerialized) {
    target.OnSerialized(buffer);
  }
}

export function DeserializeObjectFromBuffer(target: ISerializable, buffer: ByteBuffer) {
  const keys = Reflect.ownKeys(target);
  for (const key of keys) {
    const serialization = Reflect.getMetadata(SerializationIdentifier, target,
      key.toString()) as ISerialization;
    if (serialization) {
      const value = serialization.deserialize(target, buffer);
      Reflect.set(target, key, value);
    }
  }

  if (target.OnDeserialized) {
    target.OnDeserialized();
  }
}

export function BufferLength(target: any): number {
  let size = 0;
  const keys = Reflect.ownKeys(target);
  for (const key of keys) {
    const serialization = Reflect.getMetadata(SerializationIdentifier, target,
      key.toString()) as ISerialization;
    if (serialization) {
      const value = Reflect.get(target, key.toString());
      size += serialization.size(target, value);
    }
  }

  return size;
}
