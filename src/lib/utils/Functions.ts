import { Vector3, Matrix3, Matrix4, Math, Euler } from "three";

export const delay = async (ms: number) => {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

export const waitForCondition = async (condition: () => boolean) => {
  while (!condition()) {
    await delay(10);
  }
};

const blocksPerSide: number = 64;
const chunksPerBlock: number = 16;
const chunksPerRow: number = chunksPerBlock * blocksPerSide;
const fullMapSize: number = 102400/3;
const blockSize: number = fullMapSize / blocksPerSide;
const chunkSize: number = blockSize / chunksPerBlock;
const rotatex90 = new Matrix4().makeRotationX(Math.degToRad(90));
const rotatey90 = new Matrix4().makeRotationY(Math.degToRad(90));
const tmpPos = new Vector3();
const tmpMatrix = new Matrix4();

export const terrainPosToWorld = (position: number[]) => {
  const returnV = new Vector3();
  returnV.x = position[1];
  returnV.y = position[2];
  returnV.z =  position[0];
  return returnV;
}

export const worldPosToTerrain = (position: number[]) => {
  const returnV = new Vector3();
  returnV.x = position[2];
  returnV.y = position[0];
  returnV.z =  position[1];
  return returnV;
}

export const terrainCoordToWorld = (position: number[], rotation: number[]) => {
  tmpPos.x = (blocksPerSide / 2) * blockSize - position[0];
  tmpPos.y = position[1];
  tmpPos.z = (blocksPerSide / 2) * blockSize - position[2];

  const matrix = new Matrix4().makeRotationFromEuler(new Euler(Math.degToRad(rotation[0]), Math.degToRad(-rotation[1]), Math.degToRad(rotation[2])));
  // matrix.identity();
  // matrix.multiply(rotatex90);
  // matrix.multiply(rotatey90);
  matrix.setPosition(tmpPos);

  // tmpMatrix.makeRotationY(Math.degToRad(rotation[1] - 270));
  // matrix.multiply(tmpMatrix);
  // tmpMatrix.makeRotationZ(Math.degToRad(-rotation[0]));
  // matrix.multiply(tmpMatrix);
  // tmpMatrix.makeRotationX(Math.degToRad(rotation[2]-90));
  // matrix.multiply(tmpMatrix);
  return matrix;
};

export const chunkForTerrainCoordinate = (coordinate: number) => {
  return global.Math.floor((blocksPerSide * chunksPerBlock / 2) - ( coordinate / chunkSize));
}

export const blockForTerrainCoordinates = (coordinate: number) => {
  return global.Math.floor((blocksPerSide / 2) - ( coordinate / blockSize));
}

export const blockForChunk = (chunk: number) => {
  return chunk / 16;
}

export const chunksForArea = (chunkX: number, chunkY: number, radius: number): number[] => {
  const base = chunkX * chunksPerRow + chunkY;
  const indices: number[] = [];
  for (let y = -radius; y <= radius; ++y) {
    for (let x = -radius; x <= radius; ++x) {
      indices.push(base + x * chunksPerRow + y);
    }
  }

  return indices;
}
