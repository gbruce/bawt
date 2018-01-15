import { NewLogger } from '../utils/Logger';
import * as ByteBuffer from 'bytebuffer';
import 'reflect-metadata';

const Log = NewLogger('net/Socket');

const SerializationIdentifier = 'serialization';

export type SerializeFunc = (value: any, buffer: ByteBuffer) => void;
export type DeserializeFunc = (buffer: ByteBuffer) => any;

interface Serialization {
  serialize: SerializeFunc;
  deserialize: DeserializeFunc;
}

export const UInt8Prop: Serialization = {
  serialize: (value: any, buffer: ByteBuffer) => buffer.writeUint8(value),
  deserialize: (buffer: ByteBuffer): number => buffer.readUint8(),
};

export const UInt16Prop: Serialization = {
  serialize: (value: any, buffer: ByteBuffer) => buffer.writeUint16(value),
  deserialize: (buffer: ByteBuffer): number => buffer.readUint16(),
};

export const UInt32Prop: Serialization = {
  serialize: (value: any, buffer: ByteBuffer) => buffer.writeUint32(value),
  deserialize: (buffer: ByteBuffer): number => buffer.readUint32(),
};

export const StringProp: Serialization = {
  serialize: (value: any, buffer: ByteBuffer) => buffer.writeCString(value),
  deserialize: (buffer: ByteBuffer): string => buffer.readCString(),
};

export const StringNoNullProp: Serialization = {
  serialize: (value: any, buffer: ByteBuffer) => buffer.writeString(value),
  deserialize: (buffer: ByteBuffer): string => { throw new Error('Not implemented'); },
};

export function Serialize(serializer: Serialization): (target: any, propertyKey: string) => void {
  return (target: any, propertyKey: string) => {
      Reflect.defineMetadata(SerializationIdentifier, serializer, target, propertyKey);
  };
}

export function SerializeObjectToBuffer(target: any, buffer: ByteBuffer) {
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
