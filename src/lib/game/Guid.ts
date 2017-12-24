import * as ByteBuffer from 'bytebuffer';

class GUID {
  // GUID byte-length (64-bit)
  public static LENGTH = 8;

  private raw: any;
  private low: any;
  private high: any;

  // Creates a new GUID
  constructor(buffer: ByteBuffer) {

    // Holds raw byte representation
    this.raw = buffer;

    // Holds low-part
    this.low = buffer.readUint32();

    // Holds high-part
    this.high = buffer.readUint32();

  }

  // Short string representation of this GUID
  public toString() {
    const high = ('0000' + this.high.toString(16)).slice(-4);
    const low = ('0000' + this.low.toString(16)).slice(-4);
    return `[GUID; Hex: 0x${high}${low}]`;
  }
  
  public WriteTo(buffer: ByteBuffer) {
    buffer.writeUint32(this.low);
    buffer.writeUint32(this.high);
  }
}

export default GUID;
