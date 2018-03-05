import { IEvent } from 'strongly-typed-events';
import { ICrypt } from './ICrypt';

export interface IDeserializer {
  Encryption: ICrypt;
  Deserialize(buffer: Buffer): void;
  OnObjectDeserialized(opcode: string): IEvent<IDeserializer, any>;
}
