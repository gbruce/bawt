
import { Crypt } from '../../interface/Crypt';
import { NewLogger } from '../utils/Logger';

const Log = NewLogger('crypto/WowCrypt');

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

  public Decrypt(Data: number[]|Uint8Array, Length: number)
  {
    if (!this.initialised) {
      return;
    }

    for (let i = 0; i < Length; ++i)
    {
      this.mDecIndex %= this.mKey.length;
      const x = (Data[i] - this.mDecPrev) ^ this.mKey[this.mDecIndex];
      this.mDecIndex++;
      this.mDecPrev = Data[i];
      Data[i] = x;
    }
  }

  public Encrypt(Data: number[], Length: number)
  {
    if (!this.initialised) {
      return;
    }

    for (let i = 0; i < Length; ++i)
    {
      const tmp: number = Data[i];
      this.mEncIndex %= this.mKey.length;
      const x = (Data[i] ^ this.mKey[this.mEncIndex]) + this.mEncPrev;
      this.mEncIndex++;
      this.mEncPrev = x;
      Data[i] = x;
    }
  }
}
