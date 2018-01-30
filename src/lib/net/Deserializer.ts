import { EventList, IEvent } from 'strongly-typed-events';
import { Serializable, DeserializeObjectFromBuffer, BufferLength } from '../net/Serialization';
import { Factory } from '../../interface/Factory';
import * as ByteBuffer from 'bytebuffer';
import { NewLogger } from '../utils/Logger';

const log = NewLogger('net/Deserializer');

export class Deserializer {
  private events: EventList<Deserializer, any> = new EventList<Deserializer, any>();

  constructor(private map: Map<number, Factory<Serializable>>) {}

  public Deserialize(buffer: Buffer) {
    const opcode = buffer.readUInt8(0);
    const factory = this.map.get(opcode);
    if (!factory) {
      return;
    }

    const obj = factory.Create();
    const byteBuffer = new ByteBuffer();
    byteBuffer.append(buffer);
    byteBuffer.offset = 0;
    DeserializeObjectFromBuffer(obj, byteBuffer);

    log.info(`${buffer.byteLength} bytes ==> ${obj.Name}`);

    if (obj) {
      this.events.get(opcode.toString()).dispatch(this, obj);
    }
  }

  public OnObjectDeserialized(opcode: string): IEvent<Deserializer, any>
  {
    return this.events.get(opcode).asEvent();
  }
}
