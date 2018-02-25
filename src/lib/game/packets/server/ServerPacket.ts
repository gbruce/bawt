import { Serialize, UInt16Prop } from '../../../net/Serialization';
import { default as ObjectUtil } from '../../../utils/ObjectUtil';
import { IFactory } from '../../../../interface/IFactory';
import GameOpcode from '../../Opcode';
import { IPacket } from '../../../../interface/Packet';

export class NewServerPacket implements IFactory<IPacket> {
  public Create(...args: any[]) {
    return new ServerPacket(args[0]);
  }
}

export class ServerPacket implements IPacket {
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
