import { IRenderEngine, RenderEngineFactory } from 'interface/IRenderEngine';
import { IObject } from 'interface/IObject';
import { WebGLRenderer, PerspectiveCamera, Scene } from 'three';
import { interfaces } from 'inversify';

export const ThreejsFactoryImpl = (context: interfaces.Context): RenderEngineFactory => {
  return (): IRenderEngine => {
    return new ThreejsEngine();
  };
};

class ThreejsEngine implements IRenderEngine, IObject {
  private renderer: WebGLRenderer|null = null;
  private camera: PerspectiveCamera|null = null;
  private scene: Scene|null = null;

  constructor() {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    this.renderer = new WebGLRenderer( { canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.scene = new Scene();

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new PerspectiveCamera( 75, aspect, 0.1, 10000);
    this.scene.add(this.camera);
  }

  public async initialize(): Promise<void> {
  }

  public dispose(): void {
  }

  public get mainRenderer() {
    return this.renderer;
  }

  public get mainScene() {
    return this.scene;
  }

  public get mainCamera() {
    return this.camera;
  }
}
