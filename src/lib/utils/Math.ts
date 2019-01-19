import { IVector3 } from 'interface/IVector3';
import { Vector3 } from 'three';

export const MakeVector3 = (x: number, y: number, z: number): IVector3 => {
  return { x, y, z };
};

export const CopyToVector3 = (fromVector: IVector3, toVector: Vector3) => {
  toVector.x = fromVector.x;
  toVector.y = fromVector.y;
  toVector.z = fromVector.z;
};
