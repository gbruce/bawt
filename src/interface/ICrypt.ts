
export interface ICrypt {
  Init(key: number[]): void;
  Decrypt(data: number[]|Uint8Array, length: number): void;
  Encrypt(data: number[], length: number): void;
}
