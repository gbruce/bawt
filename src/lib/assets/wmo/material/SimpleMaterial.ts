import { LoadTexture } from 'bawt/worker/LoadTexture';
import { IHttpService } from 'interface/IHttpService';
import { ClampToEdgeWrapping, DoubleSide, RepeatWrapping, ShaderMaterial, Texture } from 'three';

import fragmentShader = require('./simple_shader.frag');
import vertexShader = require('./simple_shader.vert');

class WMOMaterial extends ShaderMaterial {
  private textures: any[] = [];
  private wrapping: any;

  constructor(private httpService: IHttpService, def: any, private textureDefs: any, public materialId: any) {
    super();

    this.uniforms = {
      textures: { value: [] },
      textureCount: { value: 0 },
    };

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

    this.vertexShader = vertexShader as any;
    this.fragmentShader = fragmentShader as any;
  }

  public async initialize() {
    const textures: any[] = [];

    const loaders: Promise<Texture>[] = [];
    this.textureDefs.forEach((textureDef: any) => {
      if (textureDef !== null) {
        const loader = new LoadTexture(this.httpService);
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
