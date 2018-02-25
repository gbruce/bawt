
import { Serialize, UInt32Prop, UInt64Prop, UInt8Prop } from '../../../net/Serialization';
import { ServerPacket } from './ServerPacket';
import { Factory } from '../../../../interface/Factory';
import { IPacket } from '../../../../interface/Packet';
import * as Long from 'long';
import Opcode from '../../Opcode';

export class NewSMsgSetProficiency implements Factory<IPacket> {
  public Create(...args: any[]) {
    return new SMsgSetProficiency();
  }
}

export class SMsgSetProficiency extends ServerPacket {
  constructor() {
    super(Opcode.SMSG_SET_PROFICIENCY);
  }

  @Serialize(UInt8Prop())
  public ItemClass: number = 0;

  @Serialize(UInt32Prop())
  public ItemSubclassMask: number = 0;
}
