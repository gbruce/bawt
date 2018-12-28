
export const makeAdt = (): blizzardry.IADT => {
  const adt: blizzardry.IADT = {
    flags: 0,
    version: 0,
    wdtFlags: 0,
    MCIN: {
      id: 'NICM',
      size: 0,
    },
    MCNKs: [],
    MDDF: {
      id: 'FDDM',
      size: 0,
      entries: [],
    },
    MH2O: {
      id: 'O2HM',
      size: 0,
    },
    MHDR: {
      id: 'RDHM',
      size: 0,
      flags: 0,
      offsetMCIN: 0,
      offsetMDDF: 0,
      offsetMFBO: 0,
      offsetMH2O: 0,
      offsetMMDX: 0,
      offsetMMID: 0,
      offsetMODF: 0,
      offsetMTEX: 0,
      offsetMTXF: 0,
      offsetMWID: 0,
      offsetMWMO: 0,
    },
    MMDX: {
      id: 'XDMM',
      size: 0,
      filenames: [],
    },
    MMID: {
      id: 'DIMM',
      size: 0,
    },
    MODF: {
      id: 'FDOM',
      size: 0,
      entries: [],
    },
    MTEX: {
      id: 'XETM',
      size: 0,
      filenames: [],
    },
    MVER: {
      id: 'REVM',
      size: 0,
      version: 0,
    },
    MWID: {
      id: 'DIWM',
      size: 0,
    },
    MWMO: {
      id: 'OMWM',
      size: 0,
      filesnames: [],
    },
  };

  return adt;
};
