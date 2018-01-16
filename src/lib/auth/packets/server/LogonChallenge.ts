import { Serialize, UInt8Prop, UInt16Prop, UInt32Prop } from '../../../net/Serialization';
import { ServerPacket } from './ServerPacket';
import Opcode from '../../Opcode';

export class LogonChallenge extends ServerPacket {
  constructor() {
    super(Opcode.LOGON_CHALLENGE);
  }

  @Serialize(UInt8Prop())
  public readonly Unk1: number;

  @Serialize(UInt8Prop())
  public readonly Status: number;
}
