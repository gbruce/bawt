import { Serializable } from './Serializable';

export interface Packet extends Serializable {
   readonly Opcode: number;
   readonly Name: string;
}
