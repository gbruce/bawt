import { Serializable } from './Serializable';

export interface IPacket extends Serializable {
   readonly Opcode: number;
   readonly Name: string;
}
