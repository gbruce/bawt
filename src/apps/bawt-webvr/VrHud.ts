import { Texture, MeshBasicMaterial, Mesh, PlaneGeometry, CanvasTexture, Group, Renderer } from 'three';

export class VrHud  extends Group {
  private canvas: HTMLCanvasElement;
  private hudBitmap: CanvasRenderingContext2D|null;
  private texture: Texture;
  private material: MeshBasicMaterial;
  public mesh: Mesh;
  private last: number = 0;
  private lastFrame: number = 0;

  constructor(private renderer: Renderer) {
    super();
    this.canvas = document.createElement('canvas');

    const width = 512;
    const height = 128;

    this.canvas.width = width;
    this.canvas.height = height;

    this.hudBitmap = this.canvas.getContext('2d');
    if (this.hudBitmap) {
      this.hudBitmap.fillStyle = '#00ffff';
      this.hudBitmap.fillRect(0, 0, width, height);
    }

    this.texture = new CanvasTexture(this.canvas);
    this.material = new MeshBasicMaterial({map: this.texture});

    this.mesh = new Mesh(new PlaneGeometry( 2, 0.5 ), this.material);
    this.mesh.position.z = -3;
    this.mesh.position.y = -0.9;
    this.mesh.position.x = -0.4;
  }

  public update(time: number) {
    if (this.hudBitmap) {
      if (time - this.last > 300) {
        const info = (this.renderer as any).info;
        const fps = ((info.render.frame - this.lastFrame) * 1000) / (time - this.last);
        const c = this.canvas.getContext('2d');
        if (c) {
          c.fillStyle = 'white';
          c.fillRect(0, 0, this.canvas.width, this.canvas.height);
          c.fillStyle = 'black';
          c.font = '16pt sans-serif';
          c.fillText(`calls: ${info.render.calls}`, 3, 20);
          c.fillText(`tris : ${info.render.triangles}`, 3, 40);
          c.fillText(`fps : ${fps.toFixed(2)}`, 3, 60);

          if (this.material && this.material.map) {
            this.material.map.needsUpdate = true;
          }
          this.last = time;
          this.lastFrame = info.render.frame;
        }
      }
    }
  }
}
