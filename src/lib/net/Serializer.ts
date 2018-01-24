import { SimpleEventDispatcher, ISimpleEvent } from 'strongly-typed-events';
import { SerializeObjectToBuffer, BufferLength } from '../net/Serialization';
import * as ByteBuffer from 'bytebuffer';

export class Serializer {
  private event: SimpleEventDispatcher<ArrayBuffer> = new SimpleEventDispatcher<ArrayBuffer>();

  public Serialize(obj: any) {
    const buffLength = BufferLength(obj);
    const b = new ByteBuffer(buffLength).LE();
    SerializeObjectToBuffer(obj, b);

    this.event.dispatch(b.buffer);
  }

  public get OnPacketSerialized(): ISimpleEvent<ArrayBuffer>
  {
    return this.event.asEvent();
  }
}
