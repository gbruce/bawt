
export interface Crypt {
  Init(key: number[]): void;
  Decrypt(data: number[]|Uint8Array, Length: number): void;
  Encrypt(data: number[], Length: number): void;
}
