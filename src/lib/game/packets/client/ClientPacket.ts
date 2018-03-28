import { Serialize, UInt16Prop, UInt32Prop } from 'bawt/net/Serialization';
import { default as ObjectUtil } from 'bawt/utils/ObjectUtil';
import AuthOpcode from '../../Opcode';
import { IPacket } from 'interface/IPacket';
import * as ByteBuffer from 'bytebuffer';

export class ClientPacket implements IPacket {
  constructor(opcode: number) {
    this.Opcode = opcode;
    this._name = ObjectUtil.KeyByValue(AuthOpcode, this.Opcode);
  }

  private _name: string;
  public get Name() {
    return this._name;
  }

  public readonly Opcode: number;
}
