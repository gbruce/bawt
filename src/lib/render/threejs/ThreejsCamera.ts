import { IObject } from 'interface/IObject';
import { ICamera } from 'interface/IRenderEngine';
import { IVector3 } from 'interface/IVector3';
import { IVector4 } from 'interface/IVector4';
import { PerspectiveCamera, Quaternion, Vector3 } from 'three';

export class ThreejsCamera implements ICamera, IObject {
  constructor() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new PerspectiveCamera( 75, aspect, 0.1, 10000);
    this.onResize = this.onResize.bind(this);
  }

  public async initialize(): Promise<void> {
    window.addEventListener('resize', this.onResize, true);
    window.addEventListener('vrdisplaypresentchange', this.onResize, true);
  }

  public dispose(): void {
    window.removeEventListener('vrdisplaypresentchange', this.onResize);
    window.removeEventListener('resize', this.onResize);
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
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

  private camera: PerspectiveCamera;

  private tmpPos = new Vector3();
  public setPosition(position: {x?: number, y?: number, z?: number}) {
    this.tmpPos.copy(this.camera.position);
    if (position.x) {
      this.tmpPos.x = position.x;
    }

    if (position.y) {
      this.tmpPos.y = position.y;
    }

    if (position.z) {
      this.tmpPos.z = position.z;
    }
    this.camera.position.copy(this.tmpPos);
  }

  public setRotation(rotation: {x: number, y: number, z: number, w: number}): void {
    this.camera.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
  }
}
