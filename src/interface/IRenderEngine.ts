
export type RenderEngineFactory = () => IRenderEngine;

export interface IRenderEngine {
  readonly mainRenderer: any;
  readonly mainScene: any;
  readonly mainCamera: any;

  render(camera: any, scene: any): void;
}
