import { Serialize, UInt16Prop } from '../../../net/Serialization';
import { default as ObjectUtil } from '../../../utils/ObjectUtil';
import GameOpcode from '../../Opcode';
import { Packet } from '../../../../interface/Packet';

export class ServerPacket implements Packet {
  constructor(opcode: number) {
    this.Opcode = opcode;
    this._name = ObjectUtil.KeyByValue(GameOpcode, this.Opcode);
  }
  private _name: string;
  public get Name() {
    return this._name;
  }

  public readonly Size: number = 0;
  public readonly Opcode: number;
}
