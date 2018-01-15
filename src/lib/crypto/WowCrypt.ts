
import { Crypt } from '../../interface/Crypt';
import { NewLogger } from '../utils/Logger';

const log = NewLogger('crypto/WowCrypt');

export default class WoWCrypt implements Crypt
{
  private initialised = false;

  // Encryption state
  private mEncPrev: number;
  public mEncIndex: number;

  // Decryption state
  public mDecPrev: number;
  public mDecIndex: number;

  public mKey: number[];

  public Init(key: number[])
  {
    this.mKey = key; // clone?
    this.mEncPrev = 0;
    this.mEncIndex = 0;
    this.mDecPrev = 0;
    this.mDecIndex = 0;
    this.initialised = true;
  }

  public Decrypt(data: number[]|Uint8Array, length: number)
  {
    if (!this.initialised) {
      return;
    }

    for (let i = 0; i < length; ++i)
    {
      this.mDecIndex %= this.mKey.length;
      const x = (data[i] - this.mDecPrev) ^ this.mKey[this.mDecIndex];
      this.mDecIndex++;
      this.mDecPrev = data[i];
      data[i] = x;
    }
  }

  public Encrypt(data: number[], length: number)
  {
    if (!this.initialised) {
      return;
    }

    for (let i = 0; i < length; ++i)
    {
      const tmp: number = data[i];
      this.mEncIndex %= this.mKey.length;
      const x = (data[i] ^ this.mKey[this.mEncIndex]) + this.mEncPrev;
      this.mEncIndex++;
      this.mEncPrev = x;
      data[i] = x;
    }
  }
}
