import { Serialize, UInt8Prop, UInt16Prop, UInt32Prop, StringProp,
  StringNoNullProp } from '../../../net/Serialization';
import { AuthPacket } from '../AuthPacket';
import { IFactory } from '../../../../interface/Factory';
import { IPacket } from '../../../../interface/Packet';
import Opcode from '../../Opcode';

export class LogonChallenge extends AuthPacket {
  constructor() {
    super(Opcode.LOGON_CHALLENGE);
  }

  @Serialize(UInt8Prop())
  public Unk1: number = 0;

  @Serialize(UInt16Prop())
  public Size: number = 0;

  @Serialize(StringProp())
  public Game: string = '';

  @Serialize(UInt8Prop())
  public Major: number = 0;

  @Serialize(UInt8Prop())
  public Minor: number = 0;

  @Serialize(UInt8Prop())
  public Patch: number = 0;

  @Serialize(UInt16Prop())
  public Build: number = 0;

  @Serialize(StringProp())
  public Platform: string = '';

  @Serialize(StringProp())
  public Os: string = '';

  @Serialize(StringNoNullProp())
  public Locale: string = '';

  @Serialize(UInt32Prop())
  public Timezone: number = 0;

  @Serialize(UInt32Prop())
  public IPAddress: number = 0;

  @Serialize(UInt8Prop())
  public AccountLength: number = 0;

  @Serialize(StringNoNullProp())
  public Account: string = '';
}
