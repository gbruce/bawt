
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
  init(key: any): void;
  next(): any;
  encrypt(data: any): void;
  decrypt(data: any): void;
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

declare module 'winston-browser' {}

declare module 'blizzardry/lib/mpq' {
  type open = {
    READ_ONLY: string;
    WRITE_SHARE: string;
  }

  interface FileDetails {
    filename: string;
    name: string;
    hashIndex: number;
    blockIndex: number;
    fileSize: number;
    fileFlags: number;
    compSize: number;
    fileTimeLo: number;
    fileTimeHi: number;
    locale: number;
  }

  class File {
    readonly name: string;
    readonly opened: string;
    readonly size: string;
    readonly data: Buffer|null;
    position: number;
    close(): void;
  }

  class Files {
    get(file: string):File;
    contains(file: string):boolean;
    find(pattern: string):File[];
  }

  class MPQ {
    patch(path: string, prefix: string): MPQ;
    readonly files: Files;
    readonly patched: boolean;
    readonly opened: boolean;
    close(): void;
  
    static locale: string;
    static open(path: string, flags: any): MPQ;
    static create(path: string): MPQ;


    static OPEN: open;
  }
  
  const value: MPQ;
  export = MPQ;
}

declare module 'blizzardry/lib/blp' {

  class BLP {
    close(): void;
    readonly opened: boolean;
    readonly version: number;
    readonly mipmapCount: number;
    readonly smallest: any;
    readonly largest: any;

    static open(path: string): BLP;
    static from(buffer: Buffer, callback: (blp: BLP) => void ): BLP;
  }

  export = BLP;
}

declare module 'blizzardry/lib/dbc/entities' {
  class Entity {
    dbc: any;
    fields: any;
  }

  const entities: { [type: string] : Entity };

  export = entities;
}

declare module 'blizzardry/lib/restructure' {
  namespace Restructure {
    class DecodeStream {
      constructor(buffer: Buffer)
    }
  }
  const value: any;
  export = Restructure;
}
