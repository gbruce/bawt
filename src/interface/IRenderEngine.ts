import { IVector3 } from 'interface/IVector3';
import { IVector4 } from 'interface/IVector4';

export type RenderEngineFactory = () => IRenderEngine;

export interface ILightDesc {
  position: IVector3;
  intensity: number;
}

export interface ICamera {
  readonly position: IVector3;
  rotation: IVector4;
  nativeCamera: any;

  setPosition(position: {x?: number, y?: number, z?: number}): void;
  setRotation(rotation: {x?: number, y?: number, z?: number, w?: number}): void;
}

export interface IRenderEngine {
  readonly mainRenderer: any;
  readonly mainCamera: ICamera;

  render(): void;

  updateControls(): void;

  addLight(light: ILightDesc): void;
  addObject(object: any): void;
}
