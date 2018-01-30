import { NewLogger } from '../utils/Logger';
import * as ByteBuffer from 'bytebuffer';
import 'reflect-metadata';

const Log = NewLogger('net/Socket');

export interface Serializable {
  readonly Name: string;
  OnDeserialized?(): void;
}

const SerializationIdentifier = 'serialization';
const DeserializeCallbackId = 'serialization:callback';

export type SerializeFunc = (target: any, value: any, buffer: ByteBuffer) => void;
export type DeserializeFunc = (target: any, buffer: ByteBuffer) => any;
export type SizeFunc = (target: any, value: any) => number;

interface Serialization {
  serialize: SerializeFunc;
  deserialize: DeserializeFunc;
  size: SizeFunc;
}

export const UInt8Prop = (): Serialization => {
  return {
    serialize: (target: any, value: any, buffer: ByteBuffer) => buffer.writeUint8(value),
    deserialize: (target: any, buffer: ByteBuffer): number => buffer.readUint8(),
    size: (target: any, value: any): number => 1,
  };
};

export const UInt16Prop = (): Serialization => {
  return {
    serialize: (target: any, value: any, buffer: ByteBuffer) => buffer.writeUint16(value),
    deserialize: (target: any, buffer: ByteBuffer): number => buffer.readUint16(),
    size: (target: any, value: any): number => 2,
  };
};

export const UInt32Prop = (): Serialization => {
  return {
    serialize: (target: any, value: any, buffer: ByteBuffer) => buffer.writeUint32(value),
    deserialize: (target: any, buffer: ByteBuffer): number => buffer.readUint32(),
    size: (target: any, value: any): number => 4,
  };
};

export const StringProp = (): Serialization => {
  return {
    serialize: (target: any, value: any, buffer: ByteBuffer) => buffer.writeCString(value),
    deserialize: (target: any, buffer: ByteBuffer): string => buffer.readCString(),
    size: (target: any, value: any): number => value.length + 1,
  };
};

export const StringNoNullProp = (): Serialization => {
  return {
    serialize: (target: any, value: any, buffer: ByteBuffer) => (buffer as any).writeString(value),
    deserialize: (target: any, buffer: ByteBuffer): string => { throw new Error('Not implemented'); },
    size: (target: any, value: any): number => value.length,
  };
};

export const ByteArrayProp = (sizeFunc: (target: any) => number): Serialization => {
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

export const Float32Prop = (): Serialization => {
  return {
    serialize: (target: any, value: any, buffer: ByteBuffer) => buffer.writeFloat32(value),
    deserialize: (target: any, buffer: ByteBuffer): number => buffer.readFloat32(),
    size: (target: any, value: any): number => 4,
  };
};

export const ArrayProp = (sizeFunc: (target: any) => number,
                          factoryFunc: () => any): Serialization => {
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

export function Serialize(serializer: Serialization): (target: any, propertyKey: string) => void {
  return (target: any, propertyKey: string) => {
      Reflect.defineMetadata(SerializationIdentifier, serializer, target, propertyKey);
  };
}

export function SerializeObjectToBuffer(target: Serializable, buffer: ByteBuffer) {
  const keys = Reflect.ownKeys(target);
  for (const key of keys) {
    const serialization = Reflect.getMetadata(SerializationIdentifier, target,
      key.toString()) as Serialization;
    if (serialization) {
      const value = Reflect.get(target, key.toString());
      serialization.serialize(target, value, buffer);
    }
  }
}

export function DeserializeObjectFromBuffer(target: Serializable, buffer: ByteBuffer) {
  const keys = Reflect.ownKeys(target);
  for (const key of keys) {
    const serialization = Reflect.getMetadata(SerializationIdentifier, target,
      key.toString()) as Serialization;
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
      key.toString()) as Serialization;
    if (serialization) {
      const value = Reflect.get(target, key.toString());
      size += serialization.size(target, value);
    }
  }

  return size;
}
