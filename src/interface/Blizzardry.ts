// 'blizzardry/lib/adt'
export interface ITerrainChunk {
  version: number;
  flags: number;
  wdtFlags: number;
  MCIN: {
    id: string;
    size: number;
  };
  MCNKs: any[];
  MDDF: {
    id: string;
    size: number;
    entries: any[];
  };
  MH2O: {
    id: string;
    size: number;
  };
  MHDR: {
    id: string;
    flags: number;
    size: string;
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
    id: string;
    filenames: string[];
    size: number;
  };
  MMID: {
    id: string;
    size: number;
  };
  MODF: {
    id: string;
    size: number;
    entries: any[];
  };
  MTEX: {
    id: string;
    size: number;
    filenames: string[];
  };
  MVER: {
    id: string;
    size: number;
    version: number;
  };
  MWID: {
    id: string;
    size: number;
  };
  MWMO: {
    id: string;
    size: number;
    filenames: string[];
  };
}
