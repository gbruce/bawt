
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
  const value: BigInteger;
  export = BigInteger;
}

