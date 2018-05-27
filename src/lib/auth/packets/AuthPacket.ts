import { Serialize, UInt8Prop } from 'bawt/net/Serialization';
import { default as ObjectUtil } from 'bawt/utils/ObjectUtil';
import AuthOpcode from '../Opcode';
import { IPacket } from 'interface/IPacket';

export class AuthPacket implements IPacket {
  public static Referenced = false;

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
