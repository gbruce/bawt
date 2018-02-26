import { ISerializable } from './ISerializable';

export interface IPacket extends ISerializable {
   readonly Opcode: number;
   readonly Name: string;
}
