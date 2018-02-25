import { ISerializable } from './Serializable';

export interface IPacket extends ISerializable {
   readonly Opcode: number;
   readonly Name: string;
}
