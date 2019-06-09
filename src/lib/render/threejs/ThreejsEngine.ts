import { IObject } from 'interface/IObject';
import { ICamera, ILightDesc, IRenderEngine, RenderEngineFactory } from 'interface/IRenderEngine';
import { interfaces } from 'inversify';
import { DirectionalLight, Scene, Vector3, WebGLRenderer } from 'three';

import { ThreejsCamera } from './ThreejsCamera';
import { THREE } from './VRControls';
import { VREffect } from './VREffect';

export const ThreejsFactoryImpl = (context: interfaces.Context): RenderEngineFactory => {
  return (): IRenderEngine => {
    return new ThreejsEngine();
  };
};

class ThreejsEngine implements IRenderEngine, IObject {
  private renderer: WebGLRenderer|null = null;
  private camera: ThreejsCamera;
  private scene: Scene|null = null;
  private effect: VREffect;
  private controls: THREE.VRControls;

  constructor() {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    this.renderer = new WebGLRenderer( { canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.scene = new Scene();

    this.camera = new ThreejsCamera();
    this.scene.add(this.camera.nativeCamera);

    this.effect = new VREffect(this.renderer);
    this.controls = new THREE.VRControls(this.camera.nativeCamera);
  }

  public async initialize(): Promise<void> {
    await this.camera.initialize();
  }

  public dispose(): void {
    this.camera.dispose();
  }

  public get mainRenderer() {
    return this.renderer;
  }

  public get mainCamera(): ICamera {
    return this.camera;
  }

  public render(): void {
    this.effect.render(this.scene, this.camera.nativeCamera);
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
