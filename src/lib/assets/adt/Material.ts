import { ShaderMaterial, BackSide, Color, DataTexture, LuminanceFormat, LinearFilter, Texture } from 'three';
import { IHttpService } from 'interface/IHttpService';
import { LoadTexture } from 'bawt/worker/LoadTexture';
import fragmentShader = require('./shader.frag');
import vertexShader = require('./shader.vert');
import { IObject } from 'interface/IObject';

export class Material extends ShaderMaterial implements IObject {
  private layers: any;
  private rawAlphaMaps: any;
  private textureNames: any;
  public vertexShader: any;
  public fragmentShader: any;
  public side: any;
  private layerCount: number;
  private textures: any[];
  private alphaMaps: any[];
  public uniforms: any;
  private loader: LoadTexture;

  constructor(httpService: IHttpService, data: any, textureNames: any) {
    super();

    this.loader = new LoadTexture(httpService);
    this.layers = data.MCLY.layers;
    this.rawAlphaMaps = data.MCAL.alphaMaps;
    this.textureNames = textureNames;

    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;

    this.side = BackSide;

    this.layerCount = 0;
    this.textures = [];
    this.alphaMaps = [];

    this.loadLayers();

    this.uniforms = {
      layerCount: { type: 'i', value: this.layerCount },
      alphaMaps: { type: 'tv', value: this.alphaMaps },
      textures: { type: 'tv', value: this.textures },

      // Managed by light manager
      lightModifier: { type: 'f', value: '1.0' },
      ambientLight: { type: 'c', value: new Color(0.5, 0.5, 0.5) },
      diffuseLight: { type: 'c', value: new Color(0.25, 0.5, 1.0) },

      // Managed by light manager
      fogModifier: { type: 'f', value: '1.0' },
      fogColor: { type: 'c', value: new Color(0.25, 0.5, 1.0) },
      fogStart: { type: 'f', value: 5.0 },
      fogEnd: { type: 'f', value: 400.0 },
    };
  }

  public async initialize() {}

  private loadLayers() {
    this.layerCount = this.layers.length;

    this.loadAlphaMaps();
    this.loadTextures();
  }

  private loadAlphaMaps() {
    const alphaMaps: any[] = [];

    this.rawAlphaMaps.forEach((raw: any) => {
      const texture = new DataTexture(raw, 64, 64);
      texture.format = LuminanceFormat;
      texture.minFilter = texture.magFilter = LinearFilter;
      texture.needsUpdate = true;

      alphaMaps.push(texture);
    });

    // Texture array uniforms must have at least one value present to be considered valid.
    if (alphaMaps.length === 0) {
      alphaMaps.push(new Texture());
    }

    this.alphaMaps = alphaMaps;
  }

  private async loadTextures() {
    const textures: any[] = [];

    this.layers.forEach((layer: any) => {
      const filename = this.textureNames[layer.textureID];
      const texture = this.loader.Start(filename);

      textures.push(texture);
    });

    this.textures = textures;
  }

  public dispose() {
    super.dispose();

    this.alphaMaps.forEach((alphaMap) => {
      alphaMap.dispose();
    });
  }
}

export default Material;
