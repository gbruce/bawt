import deepEqual = require('deep-equal');

import BigNum from './BigNum';
import SHA1 from './hash/SHA1';

// Secure Remote Password
// http://tools.ietf.org/html/rfc2945
class SRP {
  private _N: BigNum;
  private g: BigNum;
  private s: BigNum|null;
  private x: BigNum|null;
  private u: BigNum|null;
  private k: BigNum;
  private _B: BigNum|null;
  private v: BigNum|null;
  private _S: BigNum|null;
  private _K: any[]|null;
  private _M1: SHA1|null;
  private _M2: SHA1|null;
  private a: BigNum;
  private _A: BigNum;

  // Creates new SRP instance with given constant prime and generator
  constructor(N: any, g: any) {

    // Constant prime (N)
    this._N = BigNum.fromArray(N);

    // Generator (g)
    this.g = BigNum.fromArray(g);

    // Client salt (provided by server)
    this.s = null;

    // Salted authentication hash
    this.x = null;

    // Random scrambling parameter
    this.u = null;

    // Derived key
    this.k = new BigNum(3);

    // Server's public ephemeral value (provided by server)
    this._B = null;

    // Password verifier
    this.v = null;

    // Client-side session key
    this._S = null;

    // Shared session key
    this._K = null;

    // Client proof hash
    this._M1 = null;

    // Expected server proof hash
    this._M2 = null;

    while (true) {

      // Client's private ephemeral value (random)
      this.a = BigNum.fromRand(19);

      // Client's public ephemeral value based on the above
      // A = g ^ a mod N
      this._A = this.g.modPow(this.a, this._N);

      if (!this._A.mod(this._N).equals(BigNum.ZERO)) {
        break;
      }
    }
  }

  // Retrieves client's public ephemeral value
  get A() {
    return this._A;
  }

  // Retrieves the session key
  get K() {
    return this._K;
  }

  // Retrieves the client proof hash
  get M1() {
    return this._M1;
  }

  // Feeds salt, server's public ephemeral value, account and password strings
  public feed(s: any, B: any, I: any, P: any) {

    // Generated salt (s) and server's public ephemeral value (B)
    this.s = BigNum.fromArray(s);
    this._B = BigNum.fromArray(B);

    // Authentication hash consisting of user's account (I), a colon and user's password (P)
    // auth = H(I : P)
    const auth = new SHA1();
    auth.feed(I);
    auth.feed(':');
    auth.feed(P).finalize();

    // Salted authentication hash consisting of the salt and the authentication hash
    // x = H(s | auth)
    const x = new SHA1();
    x.feed(this.s.toArray());
    x.feed(auth.digest);
    this.x = BigNum.fromArray(x.digest);

    // Password verifier
    // v = g ^ x mod N
    this.v = this.g.modPow(this.x, this._N);

    // Random scrambling parameter consisting of the public ephemeral values
    // u = H(A | B)
    const u = new SHA1();
    u.feed(this._A.toArray());
    u.feed(this._B.toArray());
    this.u = BigNum.fromArray(u.digest);

    // Client-side session key
    // S = (B - (kg^x)) ^ (a + ux)
    const kgx = this.k.multiply(this.g.modPow(this.x, this._N));
    const aux = this.a.add(this.u.multiply(this.x));
    this._S = this._B.subtract(kgx).modPow(aux, this._N);

    // Store odd and even bytes in separate byte-arrays
    const S = this._S.toArray();
    const S1 = [];
    const S2 = [];
    for (let i = 0; i < 16; ++i) {
      S1[i] = S[i * 2];
      S2[i] = S[i * 2 + 1];
    }

    // Hash these byte-arrays
    const S1h = new SHA1();
    const S2h = new SHA1();
    S1h.feed(S1).finalize();
    S2h.feed(S2).finalize();

    // Shared session key generation by interleaving the previously generated hashes
    this._K = [];
    for (let i = 0; i < 20; ++i) {
      this._K[i * 2] = S1h.digest[i];
      this._K[i * 2 + 1] = S2h.digest[i];
    }

    // Generate username hash
    const userh = new SHA1();
    userh.feed(I).finalize();

    // Hash both prime and generator
    const Nh = new SHA1();
    const gh = new SHA1();
    Nh.feed(this._N.toArray()).finalize();
    gh.feed(this.g.toArray()).finalize();

    // XOR N-prime and generator
    const Ngh = [];
    for (let i = 0; i < 20; ++i) {
      Ngh[i] = Nh.digest[i] ^ gh.digest[i];
    }

    // Calculate M1 (client proof)
    // M1 = H( (H(N) ^ H(G)) | H(I) | s | A | B | K )
    this._M1 = new SHA1();
    this._M1.feed(Ngh);
    this._M1.feed(userh.digest);
    this._M1.feed(this.s.toArray());
    this._M1.feed(this._A.toArray());
    this._M1.feed(this._B.toArray());
    this._M1.feed(this._K);
    this._M1.finalize();

    // Pre-calculate M2 (expected server proof)
    // M2 = H( A | M1 | K )
    this._M2 = new SHA1();
    this._M2.feed(this._A.toArray());
    this._M2.feed(this._M1.digest);
    this._M2.feed(this._K);
    this._M2.finalize();
  }

  // Validates given M2 with expected M2
  public validate(M2: number[]) {
    if (!this._M2) {
      return false;
    }
    return deepEqual(M2, this._M2.digest);
  }

}

export default SRP;
