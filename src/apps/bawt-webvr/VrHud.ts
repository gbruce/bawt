import { Texture, MeshBasicMaterial, Mesh, PlaneGeometry, CanvasTexture, Group, Renderer } from 'three';
import { ma } from 'moving-averages';

const history = 50;

export class VrHud  extends Group {
  private canvas: HTMLCanvasElement;
  private hudBitmap: CanvasRenderingContext2D|null;
  private texture: Texture;
  private material: MeshBasicMaterial;
  public mesh: Mesh;
  private last: number = 0;
  private nextRender: number = 0;
  private stepTimeHistory: Array<number|undefined> = [];
  private fpsHistory: Array<number|undefined> = [];

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

  public update(time: number, stepTime: number) {
    const fps = 1000 / (time - this.last);
    this.last = time;

    if (this.stepTimeHistory.length >= history) {
      this.stepTimeHistory.shift();
    }
    this.stepTimeHistory.push(stepTime);

    if (this.fpsHistory.length >= history) {
      this.fpsHistory.shift();
    }
    this.fpsHistory.push(fps);

    if (this.hudBitmap) {
      if (time - this.nextRender) {
        this.nextRender = time + 300;
        const c = this.canvas.getContext('2d');
        if (c) {
          const info = (this.renderer as any).info;
          const stArray = ma(this.stepTimeHistory, 3);
          const st = stArray[stArray.length - 1] || 0;

          const fpsArray = ma(this.fpsHistory, 3);
          const fps2 = fpsArray[fpsArray.length - 1] || 0;

          c.fillStyle = 'white';
          c.fillRect(0, 0, this.canvas.width, this.canvas.height);
          c.fillStyle = 'black';
          c.font = '16pt sans-serif';
          c.fillText(`calls: ${info.render.calls}`, 3, 20);
          c.fillText(`tris : ${info.render.triangles}`, 3, 40);
          c.fillText(`fps : ${fps2.toFixed(2)}`, 3, 60);
          c.fillText(`animate : ${st.toFixed(1)}`, 3, 80);

          if (this.material && this.material.map) {
            this.material.map.needsUpdate = true;
          }
        }
      }
    }
  }
}
