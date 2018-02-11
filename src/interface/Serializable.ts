import * as ByteBuffer from 'bytebuffer';

export interface Serializable {
  readonly Name: string;
  OnDeserialized?(): void;
  OnSerialized?(buffer: ByteBuffer): void;
}
