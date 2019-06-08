import { IVector3 } from 'interface/IVector3';

export type RenderEngineFactory = () => IRenderEngine;

export interface ILightDesc {
  position: IVector3;
  intensity: number;
}

export interface IRenderEngine {
  readonly mainRenderer: any;
  readonly mainCamera: any;

  render(camera: any): void;

  updateControls(): void;

  addLight(light: ILightDesc): void;
  addObject(object: any): void;
}
