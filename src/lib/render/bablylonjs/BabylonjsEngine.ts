import { Engine, Scene } from 'babylonjs';
import { IObject } from 'interface/IObject';
import { ILightDesc, IRenderEngine, RenderEngineFactory } from 'interface/IRenderEngine';
import { interfaces } from 'inversify';

import { BabylonjsCamera } from './BabylonjsCamera';

export const BabylonjsFactoryImpl = (context: interfaces.Context): RenderEngineFactory => {
  return (): IRenderEngine => {
    return new BabylonjsEngine();
  };
};

class BabylonjsEngine implements IRenderEngine, IObject {
  private engine: Engine|null = null;
  private scene: Scene|null = null;
  private camera: BabylonjsCamera;

  constructor() {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
    this.camera = new BabylonjsCamera(this.scene);
  }

  public async initialize(): Promise<void> {
    await this.camera.initialize();
  }

  public dispose(): void {
    this.camera.dispose();
  }

  public get mainRenderer() {
    return this.engine;
  }

  public get mainCamera() {
    return this.camera;
  }

  public render(): void {
  }

  public updateControls(): void {

  }

  public addLight(lightDesc: ILightDesc): void {

  }

  public addObject(object: any): void {

  }
}
