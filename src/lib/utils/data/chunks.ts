
export const makeChunk = (): blizzardry.IMCNKs => {
  const chunk: blizzardry.IMCNKs = {
    areaID: 0,
    doodadCount: 0,
    flags: 0,
    holes: 0,
    id: 'KNCM',
    indexX: 0,
    indexY: 0,
    layerCount: 0,
    noEffectDoodad: 0,
    offsetMCAL: 0,
    offsetMCCV: 0,
    offsetMCLQ: 0,
    offsetMCLY: 0,
    offsetMCNR: 0,
    offsetMCRF: 0,
    offsetMCSE: 0,
    offsetMCSH: 0,
    offsetMCVT: 0,
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    predTex: 0,
    sizeMCAL: 0,
    sizeMCLQ: 0,
    sizeMCSH: 0,
    soundEmitterCount: 0,
    unknown: 0,
    wmoCount: 0,
    MCAL: {
      alphaMaps: [],
      id: 'LACM',
      size: 0,
    },
    MCLY: {
      id: 'YLCM',
      size: 0,
      layers: [],
    },
    MCNR: {
      id: 'RNCM',
      size: 0,
      normals: [],
    },
    MCRF: {
      id: 'FRCM',
      size: 0,
      doodadEntries: [],
      MDDFs: [],
      MODFs: [],
      wmoEntries: [],
    },
    MCSE: {
      id: 'ESCM',
      size: 0,
    },
    MCSH: {
      id: 'HSCM',
      size: 0,
      actualSize: 0,
    },
    MCVT: {
      id: 'TVCM',
      size: 0,
      heights: [],
    },
  };
  return chunk;
};
