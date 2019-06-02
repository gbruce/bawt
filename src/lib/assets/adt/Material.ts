import { LoadTexture } from 'bawt/worker/LoadTexture';
import { IObject } from 'interface/IObject';
import { BackSide, Color, DataTexture, LinearFilter, LuminanceFormat, ShaderMaterial,
  Texture, UniformsUtils, UniformsLib, Side } from 'three';

import fragmentShader = require('./shader.frag');
import vertexShader = require('./shader.vert');

export class Material extends ShaderMaterial implements IObject {
  private layers: any;
  private rawAlphaMaps: Uint8Array[];
  public vertexShader: any;
  public fragmentShader: any;
  public side: Side = BackSide;
  private layerCount: number = 0;
  private textures: Texture[] = [];
  private alphaMaps: Texture[] = [];
  public uniforms: any;
  private loader: LoadTexture;

  constructor(data: blizzardry.IMCNKs, private textureNames: string[]) {
    super();

    this.loader = new LoadTexture();
    this.layers = data.MCLY.layers;
    this.rawAlphaMaps = data.MCAL.alphaMaps;
    this.vertexShader = vertexShader.default;
    this.fragmentShader = fragmentShader.default;
  }

  public async initialize() {
    await this.loadLayers();

    this.uniforms = UniformsUtils.merge([
      UniformsLib.lights,
      {
        layerCount: { type: 'i', value: this.layerCount },
        alphaMaps: { type: 'tv', value: this.alphaMaps },
        textures: { type: 'tv', value: this.textures },

        // Managed by light manager
        lightModifier: { type: 'f', value: '1.0' },
        ambientLight: { type: 'c', value: new Color(0.6, 0.6, 0.6) },
        diffuseLight: { type: 'c', value: new Color(1.0, 1.0, 1.0) },

        // Managed by light manager
        // fogModifier: { type: 'f', value: '0.0' },
        // fogColor: { type: 'c', value: new Color(0.25, 0.5, 1.0) },
        // fogStart: { type: 'f', value: 5.0 },
        // fogEnd: { type: 'f', value: 400.0 },
      },
    ]);

    this.lights = true;
  }

  private async loadLayers() {
    this.layerCount = this.layers.length;

    this.loadAlphaMaps();
    await this.loadTextures();
  }

  private loadAlphaMaps() {
    const alphaMaps: Texture[] = [];

    this.rawAlphaMaps.forEach((raw: Uint8Array) => {
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
    const loading: Array<Promise<Texture>> = [];
    for (const layer of this.layers) {
      const filename = this.textureNames[layer.textureID];
      loading.push(this.loader.Start(filename));
    }

    const loaded = await Promise.all(loading);
    this.textures = loaded;
  }

  public dispose() {
    super.dispose();

    this.alphaMaps.forEach((alphaMap) => {
      alphaMap.dispose();
    });
    this.alphaMaps = [];
  }
}

export default Material;
