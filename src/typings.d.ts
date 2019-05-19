declare class ByteBuffer {
  writeString( str: string, offset?: number ): ByteBuffer | number;
}

declare module "*.json" {
  const value: any;
  export default value;
}

declare module 'jsbn/lib/big-integer' {
  const value: any;
  export = value;
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

  interface IWMOEntry {
    doodadSet: number;
    filename: string;
    flags: number;
    id: number;
    index: number;
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
    nameSet: number;
    position: {
      x: number;
      y: number;
      z: number;
    };
    rotation: {
      x: number;
      y: number;
      z: number;
    };
  }

  interface IDoodad {
    filename: string;
    flags: number;
    id: number;
    index: number;
    position: {
      x: number;
      y: number;
      z: number;
    };
    rotation: {
      x: number;
      y: number;
      z: number;
    };
    scale: number;
  }

  interface IMCNKs {
    areaID: number;
    doodadCount: number;
    flags: number;
    holes: number;
    id: 'KNCM';
    indexX: number;
    indexY: number;
    layerCount: number;
    noEffectDoodad: number;
    offsetMCAL: number;
    offsetMCCV: number;
    offsetMCLQ: number;
    offsetMCLY: number;
    offsetMCNR: number;
    offsetMCRF: number;
    offsetMCSE: number;
    offsetMCSH: number;
    offsetMCVT: number;
    position: {
      x: number;
      y: number;
      z: number;
    };
    predTex: number;
    sizeMCAL: number;
    sizeMCLQ: number;
    sizeMCSH: number;
    soundEmitterCount: number;
    unknown: number;
    wmoCount: number;
    MCAL: {
      alphaMaps: Uint8Array[];
      id: 'LACM';
      size: number;
    };
    MCLY: {
      id: 'YLCM';
      size: number;
      layers: {
        compressed: number;
        effectID: number;
        flags: number;
        offsetMCAL: number;
        skip: number;
        textureID: number;
      }[];
    };
    MCNR: {
      id: 'RNCM';
      size: number;
      normals: {
        x: number;
        y: number;
        z: number;
      }[];
    };
    MCRF: {
      id: 'FRCM';
      size: number;
      doodadEntries: IDoodad[];
      MDDFs: number[];
      MODFs: any[];
      wmoEntries: IWMOEntry[];
    };
    MCSE: {
      id: 'ESCM';
      size: number;
    };
    MCSH: {
      id: 'HSCM';
      size: number;
      actualSize: number;
    };
    MCVT: {
      id: 'TVCM';
      size: number;
      heights: number[];
    };
  }

  interface IADT {
    flags: number;
    version: number;
    wdtFlags: number;
    MCIN: {
      id: 'NICM';
      size: number;
    };

    MCNKs: IMCNKs[];
    MDDF: {
      id: 'FDDM';
      size: number;
      entries: {
        id: number;
        filename: string;
        flags: number;
        index: number;
        position: {
          x: number;
          y: number;
          z: number;
        };
        rotation: {
          x: number;
          y: number;
          z: number;
        };
        scale: number;
      }[];
    };
    MH2O: {
      id: 'O2HM';
      size: number;
    };
    MHDR: {
      id: 'RDHM';
      size: number;
      flags: number;
      offsetMCIN: number;
      offsetMDDF: number;
      offsetMFBO: number;
      offsetMH2O: number;
      offsetMMDX: number;
      offsetMMID: number;
      offsetMODF: number;
      offsetMTEX: number;
      offsetMTXF: number;
      offsetMWID: number;
      offsetMWMO: number;
    };
    MMDX: {
      id: 'XDMM';
      size: number;
      filenames: string[];
    };
    MMID: {
      id: 'DIMM';
      size: number;
    };
    MODF: {
      id: 'FDOM';
      size: number;
      entries: any[];
    };
    MTEX: {
      id: 'XETM';
      size: number;
      filenames: string[];
    };
    MVER: {
      id: 'REVM';
      size: number;
      version: number;
    };
    MWID: {
      id: 'DIWM';
      size: number;
    };
    MWMO: {
      id: 'OMWM';
      size: number;
      filesnames: string[];
    };
  }

  export interface ITextureDef {
    color: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    flags: number;
    offset: number;
  }

  export interface IMaterialDef {
    blendMode: number;
    flags: number;
    shader: number;
    textures: ITextureDef[];
  }

  export interface IWMO {
    // custom property
    filename: string;

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
        };
      }[];
    };

    MODD: {
      id: 'DDOM';
      size: number;
      doodads: {
        color: number;
        filename: string;
        filenameOffset: number;
        flags: number;
        position: {
          x: number;
          y: number;
          z: number;
        };
        rotation: {
          x: number;
          y: number;
          z: number;
          w: number;
        };
        scale: number;
      }[];
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
      materials: IMaterialDef[];
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
      filenames: {[key: number]: string};
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

  interface IWMOGroup {
    // custom property
    filename: string;

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
  namespace m2 {
    function decode(stream: any): blizzardry.IModel;
  }

  export = m2;
}

declare module 'blizzardry/lib/m2/skin' {
  namespace skin {
    function decode(stream: any): blizzardry.ISkin;
  }

  export = skin;
}

declare module 'blizzardry/lib/adt' {
  function ADT(wdtFlags: any): {
    decode(stream: any): blizzardry.IADT
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
      flags: number;
    }
  }

  export = blizzardry;
}

declare module 'blizzardry/lib/wmo' {
  namespace wmo {
    function decode(stream: any): blizzardry.IWMO;
  }

  export = wmo;
}

declare module 'blizzardry/lib/wmo/group' {
  namespace wmogroup {
    function decode(stream: any): blizzardry.IWMOGroup;
  }

  export = wmogroup;
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

declare module 'worker-loader!*' {
  class WebpackWorker extends Worker {
    constructor();
  }

  export = WebpackWorker;
}

declare module 'three-octree' {
  const content: any;
  export default content;
}

declare module 'moving-averages' {
  namespace ma {
    function dma(data: (number|undefined)[], alpha: number, noHead?: boolean): (number|undefined)[];
    function sma(data: (number|undefined)[], size: number, times?: number): (number|undefined)[];
    function ema(data: (number|undefined)[], size: number): (number|undefined)[];
    function ma(data: (number|undefined)[], size: number): (number|undefined)[];
    function wma(data: (number|undefined)[], size: number): (number|undefined)[];
  }

  export = ma;
}
