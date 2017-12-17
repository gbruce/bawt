var BigInteger = require('jsbn/lib/big-integer');

// C-like BigNum decorator for JSBN's BigInteger
class BigNum {
  private _bi: any;

  // Convenience BigInteger.ZERO decorator
  static ZERO = new BigNum(BigInteger.ZERO);

  // Creates a new BigNum
  constructor(value: any, radix?: any) {
    if (typeof value === 'number') {
      this._bi = BigInteger.fromInt(value);
    } else if (value.constructor === BigInteger) {
      this._bi = value;
    } else if (value.constructor === BigNum) {
      this._bi = value.bi;
    } else {
      this._bi = new BigInteger(value, radix);
    }
  }

  // Short string description of this BigNum
  toString() {
    return `[BigNum; Value: ${this._bi}; Hex: ${this._bi.toString(16).toUpperCase()}]`;
  }

  // Retrieves BigInteger instance being decorated
  get bi() {
    return this._bi;
  }

  // Performs a modulus operation
  mod(m: BigNum) {
    return new BigNum(this._bi.mod(m.bi));
  }

  // Performs an exponential+modulus operation
  modPow(e: BigNum, m: BigNum) {
    return new BigNum(this._bi.modPow(e.bi, m.bi));
  }

  // Performs an addition
  add(o: BigNum) {
    return new BigNum(this._bi.add(o.bi));
  }

  // Performs a subtraction
  subtract(o: BigNum) {
    return new BigNum(this._bi.subtract(o.bi));
  }

  // Performs a multiplication
  multiply(o: any) {
    return new BigNum(this._bi.multiply(o.bi));
  }

  // Performs a division
  divide(o: BigNum) {
    return new BigNum(this._bi.divide(o.bi));
  }

  // Whether the given BigNum is equal to this one
  equals(o: BigNum) {
    return this._bi.equals(o.bi);
  }

  // Generates a byte-array from this BigNum (defaults to little-endian)
  toArray(littleEndian = true, unsigned = true) {
    const ba = this._bi.toByteArray();

    if (unsigned && this._bi.s === 0 && ba[0] === 0) {
      ba.shift();
    }

    if (littleEndian) {
      return ba.reverse();
    }

    return ba;
  }

  // Creates a new BigNum from given byte-array
  static fromArray(bytes: any, littleEndian = true, unsigned = true) {
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
  static fromRand(length: any) {
    // TODO: This should use a properly seeded, secure RNG
    const bytes = [];
    for (let i = 0; i < length; ++i) {
      bytes.push(Math.floor(Math.random() * 128));
    }
    return new BigNum(bytes);
  }

}

export default BigNum;
