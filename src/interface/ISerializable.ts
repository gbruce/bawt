import * as ByteBuffer from 'bytebuffer';

export interface ISerializable {
  readonly Name: string;
  OnDeserialized?(): void;
  OnSerialized?(buffer: ByteBuffer): void;
}
