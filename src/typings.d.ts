
declare class ByteBuffer {
  writeString( str: string, offset?: number ): ByteBuffer | number;
}

declare module "*.json" {
  const value: any;
  export default value;
}

declare class BigInteger {
  constructor(a: any, b: any, c?: any);
}

declare module BigInteger {
  export let ZERO: any;
  export function fromInt(num: number): void;
}

declare module 'jsbn/lib/big-integer' {
  export = BigInteger;
}

declare module 'jsbn/lib/sha1' {
  export function fromArray(ba: number[]): number[];
  export let HMAC: {
    fromArrays(key: any, data: any): number[];
    fromStrings(key: any, data: any): string;
  }
}

declare class RC4 {
  constructor();
}

declare module 'jsbn/lib/rc4' {
  export = RC4;
}


declare class ByteBuffer2 {
  constructor(source: any, order: any, implicitGrowth: any);
}

declare module ByteBuffer2 {
  export let BIG_ENDIAN: boolean;
}

declare module 'byte-buffer' {
  export = ByteBuffer2
}
