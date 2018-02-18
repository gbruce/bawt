
import { Serialize, UInt8Prop, StringProp, UInt32Prop, Float32Prop, ArrayProp } from '../../../net/Serialization';
import { ServerPacket } from './ServerPacket';
import { Factory } from '../../../../interface/Factory';
import { Packet } from '../../../../interface/Packet';
import { Serializable } from '../../../../interface/Serializable';
import Opcode from '../../Opcode';
import { NewLogger } from '../../../utils/Logger';

const log = NewLogger('SMsgCharEnum');

// valid for 1.12.1
enum EquipmentSlots
{
    EQUIPMENT_SLOT_START        = 0,
    EQUIPMENT_SLOT_HEAD         = 0,
    EQUIPMENT_SLOT_NECK         = 1,
    EQUIPMENT_SLOT_SHOULDERS    = 2,
    EQUIPMENT_SLOT_BODY         = 3,
    EQUIPMENT_SLOT_CHEST        = 4,
    EQUIPMENT_SLOT_WAIST        = 5,
    EQUIPMENT_SLOT_LEGS         = 6,
    EQUIPMENT_SLOT_FEET         = 7,
    EQUIPMENT_SLOT_WRISTS       = 8,
    EQUIPMENT_SLOT_HANDS        = 9,
    EQUIPMENT_SLOT_FINGER1      = 10,
    EQUIPMENT_SLOT_FINGER2      = 11,
    EQUIPMENT_SLOT_TRINKET1     = 12,
    EQUIPMENT_SLOT_TRINKET2     = 13,
    EQUIPMENT_SLOT_BACK         = 14,
    EQUIPMENT_SLOT_MAINHAND     = 15,
    EQUIPMENT_SLOT_OFFHAND      = 16,
    EQUIPMENT_SLOT_RANGED       = 17,
    EQUIPMENT_SLOT_TABARD       = 18,
    EQUIPMENT_SLOT_END          = 19,
}

export class NewSMsgCharEnum implements Factory<Packet> {
  public Create(...args: any[]) {
    return new SMsgCharEnum();
  }
}

export class SMsgCharEnum extends ServerPacket {
  constructor() {
    super(Opcode.SMSG_CHAR_ENUM);
  }

  @Serialize(UInt8Prop())
  public Count: number = 0;

  @Serialize(ArrayProp( (target: SMsgCharEnum) => target.Count,
                        () => new Character()))
  public Characters: Character[] = [];
}

export class EquipmentSlot implements Serializable {
  public Name = 'Equipment';

  @Serialize(UInt32Prop())
  public DisplayInfoId: number = 0;

  @Serialize(UInt8Prop())
  public InventoryType: number = 0;
}

export class Character implements Serializable {
  @Serialize(UInt32Prop())
  public LowGuid: number = 0;

  @Serialize(UInt32Prop())
  public HighGuid: number = 0;

  @Serialize(StringProp())
  public Name: string = '';

  @Serialize(UInt8Prop())
  public Race: number = 0;

  @Serialize(UInt8Prop())
  public Class: number = 0;

  @Serialize(UInt8Prop())
  public Gender: number = 0;

  @Serialize(UInt8Prop())
  public Skin: number = 0;

  @Serialize(UInt8Prop())
  public Face: number = 0;

  @Serialize(UInt8Prop())
  public HairStyle: number = 0;

  @Serialize(UInt8Prop())
  public HairColor: number = 0;

  @Serialize(UInt8Prop())
  public Facial: number = 0;

  @Serialize(UInt8Prop())
  public Level: number = 0;

  @Serialize(UInt32Prop())
  public Zone: number = 0;

  @Serialize(UInt32Prop())
  public Map: number = 0;

  @Serialize(Float32Prop())
  public X: number = 0;

  @Serialize(Float32Prop())
  public Y: number = 0;

  @Serialize(Float32Prop())
  public Z: number = 0;

  @Serialize(UInt32Prop())
  public GuildId: number = 0;

  @Serialize(UInt32Prop())
  public CharacterFlags: number = 0;

  @Serialize(UInt8Prop())
  public FirstLogin: number = 0;

  @Serialize(UInt32Prop())
  public PetDisplayId: number = 0;

  @Serialize(UInt32Prop())
  public PetLevel: number = 0;

  @Serialize(UInt32Prop())
  public PetFamily: number = 0;

  @Serialize(ArrayProp( (target: Character) => EquipmentSlots.EQUIPMENT_SLOT_END,
                        () => new EquipmentSlot()))
  public Equipment: EquipmentSlot[] = [];

  @Serialize(UInt32Prop())
  public FirstBadDisplayId: number = 0;

  @Serialize(UInt8Prop())
  public FirstBagInventoryType: number = 0;

  public OnDeserialized() {
    log.debug(`Character lowGuid:${this.LowGuid} highGuid:${this.HighGuid} name:"${this.Name}" level:${this.Level} ` +
      `x:${this.X.toFixed(3)} y:${this.Y.toFixed(3)} z:${this.Z.toFixed(3)} zone:${this.Zone} map:${this.Map}`);
  }
}
