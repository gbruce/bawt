import { Serialize, UInt8Prop } from '../../../net/Serialization';
import { default as ObjectUtil } from '../../../utils/ObjectUtil';
import AuthOpcode from '../../Opcode';
import { Packet } from '../../../../interface/Packet';

export class ServerPacket implements Packet {
  constructor(opcode: number) {
    this.Opcode = opcode;
    this._name = ObjectUtil.KeyByValue(AuthOpcode, this.Opcode);
  }

  @Serialize(UInt8Prop)
  public readonly Opcode: number;

  private _name: string;
  public get Name() {
    return this._name;
  }
}
