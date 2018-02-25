import sha1 = require('jsbn/lib/sha1');
import RC4 = require('jsbn/lib/rc4');
import ArrayUtil from '../utils/ArrayUtil';
import { ICrypt } from '../../interface/ICrypt';
import { NewLogger } from '../utils/Logger';

const HMAC = sha1.HMAC;
const log = NewLogger('crypto/RC4Crypt');

class RC4Crypt implements ICrypt {
  private myEncrypt: RC4|null;
  private myDecrypt: RC4|null;

  // Creates crypt
  constructor() {

    // RC4's for encryption and decryption
    this.myEncrypt = null;
    this.myDecrypt = null;
  }

  public Decrypt(data: number[]|Uint8Array, length: number): void {
    if (this.myDecrypt) {
      this.myDecrypt.decrypt(data);
    }
  }

  public Encrypt(data: number[], length: number): void {
    if (this.myEncrypt) {
      this.myEncrypt.encrypt(data);
    }
  }

  // Sets session key and initializes this crypt
  public Init(key: number[]): void {
    log.info('initializing crypt');

    // Fresh RC4's
    this.myEncrypt = new RC4();
    this.myDecrypt = new RC4();

    // Calculate the encryption hash (through the server decryption key)
    const enckey = ArrayUtil.FromHex('C2B3723CC6AED9B5343C53EE2F4367CE');
    const enchash = HMAC.fromArrays(enckey, key);

    // Calculate the decryption hash (through the client decryption key)
    const deckey = ArrayUtil.FromHex('CC98AE04E897EACA12DDC09342915357');
    const dechash = HMAC.fromArrays(deckey, key);

    // Seed RC4's with the computed hashes
    this.myEncrypt.init(enchash);
    this.myDecrypt.init(dechash);

    // Ensure the buffer is synchronized
    for (let i = 0; i < 1024; ++i) {
      this.myEncrypt.next();
      this.myDecrypt.next();
    }
  }
}

export default RC4Crypt;
