//import { ByteBuffer } from 'byte-buffer';
import * as ByteBuffer from 'bytebuffer';

class Packet extends ByteBuffer {
  protected opcode: any;
  protected outgoing: boolean;
  protected name: string = 'Packet';
  private headerLength: number;

  // Creates a new packet with given opcode from given source or length
  constructor(opcode: number, source: any, outgoing: boolean = true) {
    super(source, ByteBuffer.LITTLE_ENDIAN, false);

    // Holds the opcode for this packet
    this.opcode = opcode;

    // Whether this packet is outgoing or incoming
    this.outgoing = outgoing;

    this.headerLength = source;

    // Seek past opcode to reserve space for it when finalizing
    // this.skip(this.headerSize);
    // === this.index = this.headerSize;
    // this.writeByte(opcode);
  }

  // Header size in bytes
  get headerSize():number {
    return this.headerLength;
  }

  // Body size in bytes
  get bodySize() {
    // === return this.length - this.headerSize;
    return this.offset - this.headerLength;
  }

  // Retrieves the name of the opcode for this packet (if available)
  get opcodeName() {
    return this.name;
  }

  // Short string representation of this packet
  toString() {
    const opcode = ('0000' + this.opcode.toString(16).toUpperCase()).slice(-4);
    //return `[Packet; Opcode: ${this.opcodeName || 'UNKNOWN'} (0x${opcode}); Length: ${this.length}; Body: ${this.bodySize}; Index: ${this._index}]`;
    return `[Packet opcode:${this.opcode}]`;
  }

  // Finalizes this packet
  finalize() {
    // return this;
  }

  WriteString( str: string, offset?: number ): ByteBuffer | number {
    return (<any>this).writeString(str, offset);
  }
}

export default Packet;
