import { IRenderEngine, RenderEngineFactory, ILightDesc } from 'interface/IRenderEngine';
import { IObject } from 'interface/IObject';
import { WebGLRenderer, PerspectiveCamera, Scene, DirectionalLight, Vector3 } from 'three';
import { interfaces } from 'inversify';
import { VREffect } from './VREffect';
import { THREE } from './VRControls';

export const ThreejsFactoryImpl = (context: interfaces.Context): RenderEngineFactory => {
  return (): IRenderEngine => {
    return new ThreejsEngine();
  };
};

class ThreejsEngine implements IRenderEngine, IObject {
  private renderer: WebGLRenderer|null = null;
  private camera: PerspectiveCamera|null = null;
  private scene: Scene|null = null;
  private effect: VREffect;
  private controls: THREE.VRControls;

  constructor() {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    this.renderer = new WebGLRenderer( { canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.scene = new Scene();

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new PerspectiveCamera( 75, aspect, 0.1, 10000);
    this.scene.add(this.camera);

    this.effect = new VREffect(this.renderer);
    this.controls = new THREE.VRControls(this.camera);
  }

  public async initialize(): Promise<void> {
  }

  public dispose(): void {
  }

  public get mainRenderer() {
    return this.renderer;
  }

  public get mainCamera() {
    return this.camera;
  }

  public render(camera: any): void {
    this.effect.render(this.scene, this.camera);
  }

  public updateControls(): void {
    this.controls.update();
  }

  public addLight(lightDesc: ILightDesc): void {
    if (this.scene) {
      const light = new DirectionalLight();
      light.position.copy(new Vector3(lightDesc.position.x, lightDesc.position.y, lightDesc.position.z));
      light.intensity = 0.1;
      this.scene.add(light);
    }
  }

  public addObject(object: any): void {
    if (this.scene) {
      this.scene.add(object);
    }
  }
}
