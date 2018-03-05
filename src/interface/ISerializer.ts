import { IPacket } from './IPacket';
import { ICrypt } from './ICrypt';
import { ISimpleEvent } from 'strongly-typed-events';

export interface ISerializer {
  Encryption: ICrypt;
  Serialize(packet: IPacket): void;
  readonly OnPacketSerialized: ISimpleEvent<ArrayBuffer>;
}
