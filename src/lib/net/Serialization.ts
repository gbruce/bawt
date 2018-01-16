import { NewLogger } from '../utils/Logger';
import * as ByteBuffer from 'bytebuffer';
import 'reflect-metadata';

const Log = NewLogger('net/Socket');

const SerializationIdentifier = 'serialization';

export type SerializeFunc = (value: any, buffer: ByteBuffer) => void;
export type DeserializeFunc = (buffer: ByteBuffer) => any;
export type SizeFunc = (value: any) => number;

interface Serialization {
  serialize: SerializeFunc;
  deserialize: DeserializeFunc;
  size: SizeFunc;
}

export const UInt8Prop = (): Serialization => {
  return {
    serialize: (value: any, buffer: ByteBuffer) => buffer.writeUint8(value),
    deserialize: (buffer: ByteBuffer): number => buffer.readUint8(),
    size: (value: any): number => 1,
  };
};

export const UInt16Prop = (): Serialization => {
  return {
    serialize: (value: any, buffer: ByteBuffer) => buffer.writeUint16(value),
    deserialize: (buffer: ByteBuffer): number => buffer.readUint16(),
    size: (value: any): number => 2,
  };
};

export const UInt32Prop = (): Serialization => {
  return {
    serialize: (value: any, buffer: ByteBuffer) => buffer.writeUint32(value),
    deserialize: (buffer: ByteBuffer): number => buffer.readUint32(),
    size: (value: any): number => 4,
  };
};

export const StringProp = (): Serialization => {
  return {
    serialize: (value: any, buffer: ByteBuffer) => buffer.writeCString(value),
    deserialize: (buffer: ByteBuffer): string => buffer.readCString(),
    size: (value: any): number => value.length + 1,
  };
};

export const StringNoNullProp = (): Serialization => {
  return {
    serialize: (value: any, buffer: ByteBuffer) => buffer.writeString(value),
    deserialize: (buffer: ByteBuffer): string => { throw new Error('Not implemented'); },
    size: (value: any): number => value.length,
  };
};

export const ByteArrayProp = (size: number): Serialization => {
  return {
    serialize: (value: any, buffer: ByteBuffer) => { throw new Error('Not implemented'); },
    deserialize: (buffer: ByteBuffer): number[] => {
      const result = [];
      for (let i = 0; i < size; i++) {
        result.push(buffer.readUint8());
      }
      return result;
    },
    size: (value: any): number => size,
  };
};

export function Serialize(serializer: Serialization): (target: any, propertyKey: string) => void {
  return (target: any, propertyKey: string) => {
      Reflect.defineMetadata(SerializationIdentifier, serializer, target, propertyKey);
  };
}

export function SerializeObjectToBuffer(target: any, buffer: ByteBuffer) {
  PrintDebug(target);
  const keys = Reflect.ownKeys(target);
  for (const key of keys) {
    const serialization = Reflect.getMetadata(SerializationIdentifier, target,
      key.toString()) as Serialization;
    if (serialization) {
      const value = Reflect.get(target, key.toString());
      serialization.serialize(value, buffer);
    }
  }
}

export function DeserializeObjectFromBuffer(target: any, buffer: ByteBuffer) {
  const keys = Reflect.ownKeys(target);
  for (const key of keys) {
    const serialization = Reflect.getMetadata(SerializationIdentifier, target,
      key.toString()) as Serialization;
    if (serialization) {
      const value = serialization.deserialize(buffer);
      Reflect.set(target, key, value);
    }
  }
}

export function BufferLength(target: any): number {
  let size = 0;
  const keys = Reflect.ownKeys(target);
  for (const key of keys) {
    const serialization = Reflect.getMetadata(SerializationIdentifier, target,
      key.toString()) as Serialization;
    if (serialization) {
      const value = Reflect.get(target, key.toString());
      size += serialization.size(value);
    }
  }

  return size;
}
