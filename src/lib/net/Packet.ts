import * as ByteBuffer from 'bytebuffer';
import GUID from '../game/Guid';

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
  get headerSize(): number {
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
  public toString() {
    const opcode = ('0000' + this.opcode.toString(16).toUpperCase()).slice(-4);
    return `[Packet opcode:${this.opcode}]`;
  }

  // Finalizes this packet
  public finalize() {
    // return this;
  }

  // Reads GUID from this packet
  public readGUID(): GUID {
    return new GUID(this);
  }

  public WriteString( str: string, offset?: number ): ByteBuffer | number {
    return (this as any).writeString(str, offset);
  }
}

export default Packet;
