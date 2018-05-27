
import { Serialize, UInt32Prop, UInt64Prop, UInt8Prop } from 'bawt/net/Serialization';
import { RegisterPacket, PacketFactory, WorldPacketMap } from 'bawt/net/PacketMap';
import { ServerPacket } from './ServerPacket';
import { IFactory } from 'interface/IFactory';
import { IPacket } from 'interface/IPacket';
import * as Long from 'long';
import Opcode from '../../Opcode';
import { NewLogger } from 'bawt/utils/Logger';

const log = NewLogger('SMsgSpellOGMiss');

class Factory implements IFactory<IPacket> {
  public Create(...args: any[]) {
    return new SMsgSpellOGMiss();
  }
}

@RegisterPacket(WorldPacketMap, Opcode.SMSG_SPELLLOGMISS, new Factory())
export class SMsgSpellOGMiss extends ServerPacket {
  constructor() {
    super(Opcode.SMSG_SPELLLOGMISS);
  }

  @Serialize(UInt32Prop())
  public SpellId: number = 0;

  @Serialize(UInt64Prop())
  public Guid: Long = new Long(0);

  @Serialize(UInt8Prop())
  public Unk1: number = 0;

  @Serialize(UInt32Prop())
  public TargetCount: number = 0;

  @Serialize(UInt64Prop())
  public TargetGuid: Long = new Long(0);

  @Serialize(UInt8Prop())
  public MissInfo: number = 0;

  public OnDeserialized() {
    const guidLo = this.Guid.and(0xffffffffffff).toString(16);
    const guidHi = this.Guid.shiftRight(48).and(0x0000FFFF).toString(16);
    const tGuidLo = this.TargetGuid.and(0xffffffffffff).toString(16);
    const tGuidHi = this.TargetGuid.shiftRight(48).and(0x0000FFFF).toString(16);
    log.debug(`SpellId:${this.SpellId} GuidLo:${guidLo} GuidHi:${guidHi} TGuidLo:${tGuidLo} TGuidHi:${tGuidHi}`);
  }
}
