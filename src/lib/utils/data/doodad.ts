export const makeDoodad = (properties: {
  filename?: string,
  id?: number,
} = {}): blizzardry.IDoodad => {
  const doodad: blizzardry.IDoodad = {
    filename: properties.filename || '',
    flags: 0,
    id: properties.id || 0,
    index: 0,
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    },
    scale: 1,
  };
  return doodad;
};
