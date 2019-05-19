import { IRenderEngine, RenderEngineFactory } from 'interface/IRenderEngine';
import { IObject } from 'interface/IObject';
import { Engine, Scene, Vector3, WebVRFreeCamera } from 'babylonjs';
import { interfaces } from 'inversify';

export const BabylonjsFactoryImpl = (context: interfaces.Context): RenderEngineFactory => {
  return (): IRenderEngine => {
    return new BabylonjsEngine();
  };
};

class BabylonjsEngine implements IRenderEngine, IObject {
  private engine: Engine|null = null;
  private scene: Scene|null = null;
  private camera: WebVRFreeCamera|null = null;

  constructor() {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
    this.camera = new WebVRFreeCamera('camera', new Vector3(0, 2, 0), this.scene);
  }

  public async initialize(): Promise<void> {
  }

  public dispose(): void {
  }

  public get mainRenderer() {
    return this.engine;
  }

  public get mainScene() {
    return this.scene;
  }

  public get mainCamera() {
    return this.camera;
  }
}
