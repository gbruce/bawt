import { SimpleEventDispatcher, ISimpleEvent } from 'strongly-typed-events';
import { Serializable, SerializeObjectToBuffer, BufferLength } from '../net/Serialization';
import * as ByteBuffer from 'bytebuffer';
import { NewLogger } from '../utils/Logger';

const log = NewLogger('net/Serializer');

export class Serializer {
  private event: SimpleEventDispatcher<ArrayBuffer> = new SimpleEventDispatcher<ArrayBuffer>();

  public Serialize(obj: Serializable) {
    const buffLength = BufferLength(obj);
    const b = new ByteBuffer(buffLength).LE();
    SerializeObjectToBuffer(obj, b);

    log.info(`${obj.Name} ==> ${buffLength} bytes`);
    this.event.dispatch(b.buffer);
  }

  public get OnPacketSerialized(): ISimpleEvent<ArrayBuffer>
  {
    return this.event.asEvent();
  }
}
