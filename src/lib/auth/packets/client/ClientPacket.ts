import { Serialize, UInt8Prop } from '../../../net/Serialization';
import { default as ObjectUtil } from '../../../utils/ObjectUtil';
import AuthOpcode from '../../Opcode';
import { Packet } from '../../../../interface/Packet';

export class ClientPacket implements Packet {
  constructor(private _opcode: number) {
    this._name = ObjectUtil.KeyByValue(AuthOpcode, _opcode);
  }

  public get Opcode() {
    return this._opcode;
  }

  private _name: string;
  public get Name() {
    return this._name;
  }
}
