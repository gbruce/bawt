import ByteBuffer = require('byte-buffer');

// Feedable hash implementation
class Hash {
  protected data: any;
  protected myDigest: any;

  // Creates a new hash
  constructor() {

    // Data fed to this hash
    this.data = null;

    // Resulting digest
    this.myDigest = null;

    this.reset();
  }

  // Retrieves digest (finalizes this hash if needed)
  get digest() {
    if (!this.myDigest) {
      this.finalize();
    }
    return this.myDigest;
  }

  // Resets this hash, voiding the digest and allowing new feeds
  public reset() {
    this.data = new ByteBuffer(0, ByteBuffer.BIG_ENDIAN, true);
    this.myDigest = null;
    return this;
  }

  // Feeds hash given value
  public feed(value: any) {
    if (this.myDigest) {
      return this;
    }

    if (value.constructor === String) {
      this.data.writeString(value);
    } else {
      this.data.write(value);
    }

    return this;
  }

  // Finalizes this hash, calculates the digest and blocks additional feeds
  public finalize() {
  }

}

export default Hash;
