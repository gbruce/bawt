var SHA1Base = require('jsbn/lib/sha1');

import { default as Hash } from '../Hash';

// SHA-1 implementation
class SHA1 extends Hash {

  // Finalizes this SHA-1 hash
  finalize() {
    this._digest = SHA1Base.fromArray(this._data.toArray());
  }

}

export default SHA1;
