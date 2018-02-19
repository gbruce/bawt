import { Serialize, UInt16Prop, UInt32Prop } from '../../../net/Serialization';
import { default as ObjectUtil } from '../../../utils/ObjectUtil';
import AuthOpcode from '../../Opcode';
import { Packet } from '../../../../interface/Packet';
import * as ByteBuffer from 'bytebuffer';

export class ClientPacket implements Packet {
  constructor(opcode: number) {
    this.Opcode = opcode;
    this._name = ObjectUtil.KeyByValue(AuthOpcode, this.Opcode);
  }

  private _name: string;
  public get Name() {
    return this._name;
  }

  public readonly Size: number = 0;

  public readonly Opcode: number;
}
