
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

declare namespace blizzardry {
  interface IField {
    endian: string;
    fn: string;
    type: string;
    encode(data:any):any;
    decode(data:any):any;
  }

  interface IEntity {
    dbc: any;
    fields: { [type: string]: IField };
  }
}

declare module 'blizzardry/lib/dbc/entities' {
  class blizzardry {
    [type: string]: blizzardry.IEntity;
  }

  const b:blizzardry;
  export = b;
}

declare module 'blizzardry/lib/dbc' {
  namespace blizzardry {
    export interface IAreaTable {
      id: number;
      mapID: number;
      parentID: number;
      areaBit: number;
      flags: number;
      soundPreferenceID: number;
      underwaterSoundPreferenceID: number;
      soundAmbienceID: number;
      zoneMusicID: number;
      zoneIntroMusicID: number;
      level: number;
      name: string;
      factionGroupID: number;
      liquidTypes: number[];
      minElevation: number;
      ambientMultiplier: number;
      lightID: number; 
    }

    export interface ICreatureDisplayInfo {
      id: number;
      modelID: number;
      soundID: number;
      extraInfoID: number;
      scale: number;
      opacity: number;
      skin1: string;
      skin2: string;
      skin3: string;
      portraitTexture: string;
      skips: number[];
    }

    export interface IDBC {
      records: any[];
    }

    function decode(stream: any): IDBC;
  }

  export = blizzardry;
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

declare module 'blizzardry/lib/m2' {
  namespace blizzardry {
    function decode(stream: any): IModel;

    export interface IMaterial {
      blendingMode: number;
      renderFlags: number;
    }

    export interface IBone {
      animated: boolean;
      billboardType: any;
      billboarded: boolean;
      flags: any;
      keyBoneID: number;
      parentID: number;
      pivotPoint: number[];
      rotation: IAnimationBlock;
      scaling: IAnimationBlock;
      submeshID: number;
      translation: IAnimationBlock;
    }

    export interface ITrackOptions {
      target: any;
      property: string;
      animationBlock: IAnimationBlock;
      trackType: string;
      valueTransform?: (value: any) => any[];
    }
    
    export interface IAnimationBlock {
      animated: boolean;
      empty: boolean;
      firstKeyframe: any;
      globalSequenceID: number;
      interpolationType: any;
      keyframeCount: number;
      maxTrackLength: number;
      timestamps: any[];
      trackCount: number;
      tracks: any[];
      values: any[];
      parent: any;
    }

    export interface IAnimation {
      alias: number;
      blendTime: number;
      boundingRadius: number;
      flags: number;
      id: number;
      length: number;
      maxBoundingBox: {x: number, y: number, z: number};
      minBoundingBox: {x: number, y: number, z: number};
      movementSpeed: number;
      nextAnimationID: number;
      probability: number;
      subID: number;
      parent: any;
    }

    export interface ITexture {
      filename: string;
      flags: number;
      length: number;
      type: number;
      parent: any;
    }

    export interface IVertex {
      boneIndices: number[];
      boneWeights: number[];
      normal: number[];
      position: number[];
      textureCoords: number[][2];
    }

    export interface IPoint3 {
      x: number;
      y: number;
      z: number;
    }

    export interface IModel {
      animated: boolean;
      animationLookups: number;
      animations: IAnimation[];
      attachmentLookups: number;
      attachments: any[];
      boneLookups: number[];
      bones: IBone[];
      boundingNormals: number;
      boundingRadius: number;
      boundTriangles: number;
      boundingVertices: number;
      cameraLookups: number;
      cameras: number;
      canInstance: boolean;
      events: any;
      flags: any;
      keyBoneLookups: number[];
      lights: any;
      materials: IMaterial[];
      maxBoundingBox: IPoint3;
      maxVertexBox: IPoint3;
      minBoundingBox: IPoint3;
      minVertexBox: IPoint3;
      name: string;
      names: string[];
      overrideBlending: boolean;
      parent: any;
      particleEmitters: number;
      replacableTextures: number;
      ribbonEmitters: number;
      sequences: any[];
      signature: string;
      textureLookups: number[];
      textureMappings: number[];
      textures: ITexture[];
      transparencyAnimationLookups: number[];
      transparencyAnimations: IAnimationBlock[];
      uvAnimationLookups: number[];
      uvAnimations: any[];
      version: number;
      vertexColorAnimations: any[];
      vertexRadius: number;
      vertices: IVertex[];
      viewCount: number;
    }
  }

  export = blizzardry;
}

declare module 'blizzardry/lib/m2/skin' {
  namespace blizzardry {
    function decode(stream: any): ISkin;

    interface IBatch {
      flags: number;
      layer: number;
      materialIndex: number;
      opCount: number;
      shaderID: number;
      submeshIndex: number;
      submeshIndex2: number;
      textureLookup: number;
      textureMappingIndex: number;
      transparencyAnimationLookup: number;
      uvAnimationLookup: number;
      vertexColorAnimationIndex: number;
      textureIndices?: any;
      uvAnimationIndices?: any;
      parent: any;
    }

    interface ISkin {
      batches: IBatch[];
      boneCount: number;
      boneIndices: any[];
      indices: any[];
      parent: any;
      signature: string;
      submeshes: any[];
      triangles: any[];
    }
  }

  export = blizzardry;
}

declare function importScripts(...urls: string[]): void;

declare module '*.vert' {
  const content: any;
  export default content;
}

declare module '*.frag' {
  const content: any;
  export default content;
}
