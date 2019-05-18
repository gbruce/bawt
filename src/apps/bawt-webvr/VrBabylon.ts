
import { Engine, Scene, Vector3, WebVRFreeCamera } from 'babylonjs';

export class VrBablylon {
  private engine: Engine;
  private scene: Scene;
  private camera: WebVRFreeCamera;

  constructor() {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
    this.camera = new WebVRFreeCamera('camera', new Vector3(0, 2, 0), this.scene);
  }
}
