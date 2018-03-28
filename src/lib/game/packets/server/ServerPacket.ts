import { Serialize, UInt16Prop } from 'bawt/net/Serialization';
import { default as ObjectUtil } from 'bawt/utils/ObjectUtil';
import { IFactory } from 'interface/IFactory';
import GameOpcode from '../../Opcode';
import { IPacket } from 'interface/IPacket';

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
