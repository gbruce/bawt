import { Serializable, Serialize, Float32Prop, UInt8Prop, UInt16Prop, UInt32Prop, StringProp,
  ArrayProp } from '../../../net/Serialization';
import { ServerPacket } from './ServerPacket';
import { Factory } from '../../../../interface/Factory';
import Opcode from '../../Opcode';

export class RealmListFactory implements Factory<Serializable> {
  public Create(...args: any[]) {
    return new RealmList();
  }
}

export class Realm implements Serializable {
  @Serialize(UInt32Prop())
  public Type: number = 0;

  @Serialize(UInt8Prop())
  public Flags: number = 0;

  @Serialize(StringProp())
  public Name: string = '';

  @Serialize(StringProp())
  public Address: string = '';

  @Serialize(Float32Prop())
  public Population: number = 0;

  @Serialize(UInt8Prop())
  public CharacterCount: number = 0;

  @Serialize(UInt8Prop())
  public Timezone: number = 0;

  @Serialize(UInt8Prop())
  public Id: number = 0;

  public Host: string;
  public Port: number;

  public OnDeserialized() {
    const parts = this.Address.split(':');
    this.Host = parts[0];
    this.Port = parseInt(parts[1], 10);
  }
}

export class RealmList extends ServerPacket {
  constructor() {
    super(Opcode.REALM_LIST);
  }

  @Serialize(UInt16Prop())
  public PacketSize: number = 0;

  @Serialize(UInt32Prop())
  public Unk1: number = 0;

  @Serialize(UInt8Prop())
  public RealmCount: number = 0;

  @Serialize(ArrayProp( (target: RealmList) => target.RealmCount,
                        () => new Realm()))
  public Realms: Realm[] = [];
}
