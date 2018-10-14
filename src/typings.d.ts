
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

declare module 'blizzardry/lib/adt' {
  function ADT(wdtFlags: any): {
    decode(stream: any): any;
  };

  export = ADT;
}

declare module 'blizzardry/lib/wdt' {
  namespace blizzardry {
    function decode(stream: any): any;

    interface IWDT {
      MAIN: {
        id: 'NIAM';
        size: number;
        tiles: {
          flags: number;
        }[];
      };

      MPHD: {
        id: 'DHPM';
        flags: number;
        size: number;
      };

      MVER: {
        id: 'REVM';
        size: number;
        version: number;
      };

      MWMO: {
        id: 'OMWM';
        size: number;
        filenames: string[];
      };

      tiles: number[];
      version: number;
    }
  }

  export = blizzardry;
}

declare module 'blizzardry/lib/wmo' {
  namespace blizzardry {
    function decode(stream: any): IWMO;

    interface IWMO {
      version: number;
      flags: number;
      
      MFOG: {
        id: 'GOFM';
        size: number;
        fogs: {
          color: number;
          color2: number;
          flags: number;
          fogEnd: number;
          fogStartMultiplier: number;
          largerRadius: number;
          smallerRadius: number;
          position: {
            x: number;
            y: number;
            z: number;
          }
        }[];
      };

      MODD: {
        id: 'DDOM';
        size: number;
        doodads: any[];
      };

      MODN: {
        id: 'NDOM';
        size: number;
        filenames: {};
      };

      MODS: {
        id: 'SDOM';
        size: number;
        sets: {
          doodadCount: number;
          name: string;
          startIndex: number;
        }[];
      };

      MOGI: {
        id: 'IGOM';
        size: number;
        groups: {
          flags: number;
          indoor: boolean;
          nameOffset: number;
          maxBoundingBox: {
            x: number;
            y: number;
            z: number;
          };
          minBoundingBox: {
            x: number;
            y: number;
            z: number;
          };
        }[];
      };

      MOGN: {
        id: 'NGOM';
        size: number;
        names: string[];
      };

      MOHD: {
        id: 'DHOM';
        size: number;
        baseColor: {
          r: number;
          g: number;
          b: number;
          a: number;
        };
        doodadCount: number;
        doodadSetCount: number;
        flags: number;
        groupCount: number;
        lightCount: number;
        modelCount: number;
        portalCount: number;
        skipBaseColor: boolean;
        textureCount: number;
        wmoID: number;
        maxBoundingBox: {
          x: number;
          y: number;
          z: number;
        };
        minBoundingBox: {
          x: number;
          y: number;
          z: number;
        };
      };

      MOLT: {
        id: 'TLOW';
        size: number;
      };

      MOMT: {
        id: 'TMOM';
        size: number;
        materials: {
          blendMode: number;
          flags: number;
          shader: number;
          textures: {
            color: {
              r: number;
              g: number;
              b: number;
              a: number;
            };
            flags: number;
            offset: number;
          }[];
        }[];
      };

      MOPR: {
        id: 'RPOM';
        size: number;
        references: {
          groupIndex: number;
          portalIndex: number;
          side: number;
          unknown1: number;
        }[];
      };

      MOPT: {
        id: 'TPOM';
        size: number;
        portals: {
          plane: {
            constant: number;
            normal: number[];
          };
          vertexCount: number;
          vertexoffset: number;
        }[];
      };

      MOPV: {
        id: 'VPOM';
        size: number;
        vertices: any[];
      };

      MOSB: {
        id: 'BSOM';
        size: number;
        skybox: string;
      };

      MOTX: {
        id: 'XTOM';
        size: number;
        filenames: string[];
      };

      MOVB: {
        id: string;
        size: number;
      };

      MOVV: {
        id: string;
        size: number;
      };

      MVER: {
        id: 'REVM';
        size: number;
        version: number;
      };
    }
  }

  export = blizzardry;
}

declare module 'blizzardry/lib/wmo/group' {
  namespace blizzardry {
    function decode(stream: any): IWMOGroup;

    interface IWMOGroup {
      flags: number;
      indoor: boolean;
      version: number;

      MOBA: {
        id: string;
        size: number;
        batches: {
          firstIndex: number;
          firstVertex: number;
          indexCount: number;
          lastVertex: number;
          materialID: number;
        }[];
      };

      MOBN: {
        id: string;
        size: number;
      };

      MOBR: {
        id: string;
        size: number;
      };

      MOCV: {
        id: string;
        size: number;
        colors: {
          r: number;
          g: number;
          b: number;
          a: number;
        }[];
      };

      MODR: {
        id: string;
        size: number;
        doodadIndices: number[];
      };

      MOGP: {
        id: string;
        size: number;
        aBatchCount: number;
        descriptionOffset: number;
        exteriorBatchCount: number;
        flags: number;
        groupId: number;
        interiorBatchCount: number;
        nameOffset: number;
        portalOffset: number;
        fogOffsets: number[];
        maxBoundingBox: {
          x: number;
          y: number;
          z: number;
        };
        minBoundingBox:  {
          x: number;
          y: number;
          z: number;
        };
      };

      MOLR: {
        id: string;
        size: number;
      };

      MONR: {
        id: string;
        size: number;
        normals: number[][];
      };

      MOPY: {
        id: string;
        size: number;
        triangles: {
          flags: number;
          materialID: number;
        }[];
      };

      MOTV: {
        id: string;
        size: number;
        textureCoords: number[][];
      };

      MOVI: {
        id: string;
        size: number;
        triangles: number[];
      };

      MOVT: {
        id: string;
        size: number;
        vertices: number[][];
      };

      MVER: {
        id: string;
        size: number;
        version: number;
      };
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

declare module 'three/examples/js/controls/VRControls' {

}

declare module 'webvr-ui' {
  import { EventEmitter } from "events";
  namespace webvrui {
    class EnterVRButton extends EventEmitter {
      constructor(sourceCanvas: any, options: {
          domElement?: HTMLElement,
          injectCSS?: boolean,
          beforeEnter?: any,
          beforeExit?: any,
          onRequestStateChange?: any,
          textEnterVRTitle?: string,
          textVRNotFoundTitle?: string,
          textExitVRTitle?: string,
          color?: any,
          background?: any,
          corners?: any,
          disabledOpacity?: boolean,
          cssprefix?: string,
        },
      );

      public requestEnterFullscreen():Promise<void>;
      public isPresenting(): boolean;
      public domElement: HTMLElement;
    }
  }
  // const content: any;
  // export default content;
  export = webvrui;
}
