import { Quaternion, Scene, Vector3, WebVRFreeCamera } from 'babylonjs';
import { IObject } from 'interface/IObject';
import { ICamera } from 'interface/IRenderEngine';
import { IVector3 } from 'interface/IVector3';
import { IVector4 } from 'interface/IVector4';

export class BabylonjsCamera implements ICamera, IObject {
  private camera: WebVRFreeCamera;

  constructor(scene: Scene) {
    this.camera = new WebVRFreeCamera('camera', new Vector3(0, 2, 0), scene);
  }

  public async initialize(): Promise<void> {
  }

  public dispose(): void {
  }

  private _position: Vector3 = new Vector3();
  public get position(): IVector3 {
    return this._position;
  }

  private _rotation: Quaternion = new Quaternion();
  public get rotation(): IVector4 {
    return this._rotation;
  }

  public get nativeCamera(): any {
    return this.camera;
  }

  public setPosition = () => {
    const tmpPos = new Vector3();
    return (position: {x?: number, y?: number, z?: number}) => {
      tmpPos.copyFrom(this.camera.position);
      if (position.x) {
        tmpPos.x = position.x;
      }

      if (position.y) {
        tmpPos.y = position.y;
      }

      if (position.z) {
        tmpPos.z = position.z;
      }
      this.camera.position.copyFrom(tmpPos);
    };
  }

  public setRotation(rotation: {x: number, y: number, z: number, w: number}): void {
    this.camera.rotationQuaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
  }
}
