import { IObject } from 'interface/IObject';
import { Object3D } from 'three';

export interface ISceneObject extends IObject {
  readonly object3d: Object3D;
}
