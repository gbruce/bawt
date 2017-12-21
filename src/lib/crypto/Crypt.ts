var HMAC = require('jsbn/lib/sha1').HMAC;
var RC4 = require('jsbn/lib/rc4');

import ArrayUtil from '../utils/ArrayUtil';

class Crypt {
  private _encrypt: any;
  private _decrypt: any;

  // Creates crypt
  constructor() {

    // RC4's for encryption and decryption
    this._encrypt = null;
    this._decrypt = null;

  }

  // Encrypts given data through RC4
  encrypt(data: any) {
    if (this._encrypt) {
      this._encrypt.encrypt(data);
    }
    return this;
  }

  // Decrypts given data through RC4
  decrypt(data: any) {
    if (this._decrypt) {
      this._decrypt.decrypt(data);
    }
    return this;
  }

  // Sets session key and initializes this crypt
  set key(key: any) {
    console.info('initializing crypt');

    // Fresh RC4's
    this._encrypt = new RC4();
    this._decrypt = new RC4();

    // Calculate the encryption hash (through the server decryption key)
    const enckey = ArrayUtil.FromHex('C2B3723CC6AED9B5343C53EE2F4367CE');
    const enchash = HMAC.fromArrays(enckey, key);

    // Calculate the decryption hash (through the client decryption key)
    const deckey = ArrayUtil.FromHex('CC98AE04E897EACA12DDC09342915357');
    const dechash = HMAC.fromArrays(deckey, key);

    // Seed RC4's with the computed hashes
    this._encrypt.init(enchash);
    this._decrypt.init(dechash);

    // Ensure the buffer is synchronized
    for (let i = 0; i < 1024; ++i) {
      this._encrypt.next();
      this._decrypt.next();
    }
  }

}

export default Crypt;
