import { Serializable, Serialize, Float32Prop, UInt8Prop, UInt16Prop, UInt32Prop, StringProp,
  ArrayProp } from '../../../net/Serialization';
import { ServerPacket } from './ServerPacket';
import { Factory } from '../../../../interface/Factory';
import { Realm as RealmInterface } from '../../../../interface/Realm';
import Opcode from '../../Opcode';
import { NewLogger } from '../../../utils/Logger';

const log = NewLogger('RealmList');

export class RealmListFactory implements Factory<Serializable> {
  public Create(...args: any[]) {
    return new RealmList();
  }
}

export class Realm implements Serializable, RealmInterface {
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

    log.debug(`Realm id:${this.Id} name:"${this.Name}" addr:${this.Address} ` +
      `pop:${this.Population.toFixed(2)} char:${this.CharacterCount}`);
  }
}

export class RealmList extends ServerPacket implements Serializable {
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
