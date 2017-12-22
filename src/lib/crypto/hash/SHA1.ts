import SHA1Base = require('jsbn/lib/sha1');

import { default as Hash } from '../Hash';

// SHA-1 implementation
class SHA1 extends Hash {

  // Finalizes this SHA-1 hash
  public finalize() {
    this.myDigest = SHA1Base.fromArray(this.data.toArray());
  }

}

export default SHA1;
