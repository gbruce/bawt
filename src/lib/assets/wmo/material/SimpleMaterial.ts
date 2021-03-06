import { LoadTexture } from 'bawt/worker/LoadTexture';
import { IObject } from 'interface/IObject';
import { ClampToEdgeWrapping, DoubleSide, RepeatWrapping, ShaderMaterial, Texture, UniformsUtils, UniformsLib, Color } from 'three';

import fragmentShader = require('./simple_shader.frag');
import vertexShader = require('./simple_shader.vert');

class WMOMaterial extends ShaderMaterial implements IObject {
  private textures: any[] = [];
  private wrapping: any;

  constructor(def: any, private textureDefs: any, public materialId: any) {
    super();

    this.uniforms = this.uniforms = UniformsUtils.merge([
      UniformsLib['lights'],
      {
        lights: { value: true },
        textures: { value: [] },
        textureCount: { value: 0 },
        ambientLight: { value: new Color(0.4, 0.4, 0.4) },
        diffuseLight: { value: new Color(1.0, 1.0, 1.0) },
      }
    ]);

    // Transparent blending
    if (def.blendMode === 1) {
      this.transparent = true;
      this.side = DoubleSide;
    }

    // Flag 0x04: no backface culling
    if (def.flags & 0x04) {
      this.side = DoubleSide;
    }

    // Flag 0x40: clamp to edge
    if (def.flags & 0x40) {
      this.wrapping = ClampToEdgeWrapping;
    } else {
      this.wrapping = RepeatWrapping;
    }

    this.lights = true;
    this.vertexShader = vertexShader.default as any;
    this.fragmentShader = fragmentShader.default as any;
  }

  public async initialize() {
    const textures: any[] = [];

    const loaders: Promise<Texture>[] = [];
    this.textureDefs.forEach((textureDef: any) => {
      if (textureDef !== null) {
        const loader = new LoadTexture();
        loaders.push(loader.Start(textureDef.path, this.wrapping, this.wrapping, false));
      }
    });

    const loadedTextures = await Promise.all(loaders);

    for (const texture of loadedTextures) {
      textures.push(texture);
    }

    // Update shader uniforms to reflect loaded textures.
    this.uniforms.textures = { value: textures };
    this.uniforms.textureCount = { value: textures.length };
  }

  public dispose() {
    super.dispose();

    // todo: release texture
    // this.textures.forEach((texture) => {
    //   this.textureLoader.unload(texture);
    // });
  }
}

export default WMOMaterial;
