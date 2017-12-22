import BigInteger = require('jsbn/lib/big-integer');

// C-like BigNum decorator for JSBN's BigInteger
class BigNum {
  // Convenience BigInteger.ZERO decorator
  public static ZERO = new BigNum(BigInteger.ZERO);

// Creates a new BigNum from given byte-array
  public static fromArray(bytes: any, littleEndian = true, unsigned = true) {
    if (typeof bytes.toArray !== 'undefined') {
      bytes = bytes.toArray();
    } else {
      bytes = bytes.slice(0);
    }

    if (littleEndian) {
      bytes = bytes.reverse();
    }

    if (unsigned && bytes[0] & 0x80) {
      bytes.unshift(0);
    }

    return new BigNum(bytes);
  }

  // Creates a new random BigNum of the given number of bytes
  public static fromRand(length: any) {
    // TODO: This should use a properly seeded, secure RNG
    const bytes = [];
    for (let i = 0; i < length; ++i) {
      bytes.push(Math.floor(Math.random() * 128));
    }
    return new BigNum(bytes);
  }

  private myBi: any;

  // Creates a new BigNum
  constructor(value: any, radix?: any) {
    if (typeof value === 'number') {
      this.myBi = BigInteger.fromInt(value);
    } else if (value.constructor === BigInteger) {
      this.myBi = value;
    } else if (value.constructor === BigNum) {
      this.myBi = value.bi;
    } else {
      this.myBi = new BigInteger(value, radix);
    }
  }

  // Short string description of this BigNum
  public toString() {
    return `[BigNum; Value: ${this.bi}; Hex: ${this.myBi.toString(16).toUpperCase()}]`;
  }

  // Retrieves BigInteger instance being decorated
  get bi() {
    return this.myBi;
  }

  // Performs a modulus operation
  public mod(m: BigNum) {
    return new BigNum(this.myBi.mod(m.bi));
  }

  // Performs an exponential+modulus operation
  public modPow(e: BigNum, m: BigNum) {
    return new BigNum(this.myBi.modPow(e.bi, m.bi));
  }

  // Performs an addition
  public add(o: BigNum) {
    return new BigNum(this.myBi.add(o.bi));
  }

  // Performs a subtraction
  public subtract(o: BigNum) {
    return new BigNum(this.myBi.subtract(o.bi));
  }

  // Performs a multiplication
  public multiply(o: any) {
    return new BigNum(this.myBi.multiply(o.bi));
  }

  // Performs a division
  public divide(o: BigNum) {
    return new BigNum(this.myBi.divide(o.bi));
  }

  // Whether the given BigNum is equal to this one
  public equals(o: BigNum) {
    return this.myBi.equals(o.bi);
  }

  // Generates a byte-array from this BigNum (defaults to little-endian)
  public toArray(littleEndian = true, unsigned = true) {
    const ba = this.myBi.toByteArray();

    if (unsigned && this.myBi.s === 0 && ba[0] === 0) {
      ba.shift();
    }

    if (littleEndian) {
      return ba.reverse();
    }

    return ba;
  }
}

export default BigNum;
