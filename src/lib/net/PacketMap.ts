import { IFactory } from 'interface/IFactory';
import { IPacket } from 'interface/IPacket';
import { NewLogger } from 'bawt/utils/Logger';
const log = NewLogger('net/PacketMap');

export const RegisterPacket = (packetMap: PacketMap, opcode: number, factory: IFactory<IPacket>) => {
  return (target: any) => {
    packetMap.Set(opcode, factory);
  };
};

export class PacketMap {
  private map = new Map<number, IFactory<IPacket>>();

  constructor(private name: string) {}

  public Has(opcode: number) {
    return this.map.has(opcode);
  }

  public Set(opcode: number, factory: IFactory<IPacket>) {
    if (!this.map.has(opcode)) {
      this.map.set(opcode, factory);
      log.info(`Registeredd packetMap:${this.name} opcode:${opcode}`);
    }
  }

  public Create(opcode: number) {
    if (this.map.has(opcode)) {
      const factory = this.map.get(opcode);
      if (factory) {
        return factory.Create();
      }
    }

    log.warn(`Did not find packet for packetMap:${this.name} opcode:${opcode}`);

    return null;
  }
}

export const AuthPacketMap = new PacketMap('Auth');
export const WorldPacketMap = new PacketMap('World');
