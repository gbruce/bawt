import { Serialize, UInt8Prop, UInt16Prop, UInt32Prop, StringProp,
  StringNoNullProp } from '../../../net/Serialization';
import { ClientPacket } from './ClientPacket';
import Opcode from '../../Opcode';

export class LogonChallenge extends ClientPacket  {
  constructor() {
    super(Opcode.LOGON_CHALLENGE);
  }

  @Serialize(UInt8Prop())
  public Unk1: number;

  @Serialize(UInt16Prop())
  public Size: number;

  @Serialize(StringProp())
  public Game: string;

  @Serialize(UInt8Prop())
  public Major: number;

  @Serialize(UInt8Prop())
  public Minor: number;

  @Serialize(UInt8Prop())
  public Patch: number;

  @Serialize(UInt16Prop())
  public Build: number;

  @Serialize(StringProp())
  public Platform: string;

  @Serialize(StringProp())
  public Os: string;

  @Serialize(StringNoNullProp())
  public Locale: string;

  @Serialize(UInt32Prop())
  public Timezone: number;

  @Serialize(UInt32Prop())
  public IPAddress: number;

  @Serialize(UInt8Prop())
  public AccountLength: number;

  @Serialize(StringNoNullProp())
  public Account: string;
}
