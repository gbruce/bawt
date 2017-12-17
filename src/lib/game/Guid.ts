class GUID {
  private raw: any;
  private low: any;
  private high: any;
  
  // GUID byte-length (64-bit)
  static LENGTH = 8;

  // Creates a new GUID
  constructor(buffer: any) {

    // Holds raw byte representation
    this.raw = buffer;

    // Holds low-part
    this.low = buffer.readUnsignedInt();

    // Holds high-part
    this.high = buffer.readUnsignedInt();

  }

  // Short string representation of this GUID
  toString() {
    const high = ('0000' + this.high.toString(16)).slice(-4);
    const low = ('0000' + this.low.toString(16)).slice(-4);
    return `[GUID; Hex: 0x${high}${low}]`;
  }

}

export default GUID;
