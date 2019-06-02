import { ShaderMaterial, Color, DoubleSide, ClampToEdgeWrapping, RepeatWrapping } from 'three';

import { TextureLoader } from 'bawt/assets/TextureLoader';
import vertexShader = require('./simple_shader.vert');
import fragmentShader = require('./simple_shader.frag');

class WMOMaterial extends ShaderMaterial {
  private textures: any[];
  private wrapping: any;
  private textureLoader: TextureLoader = new TextureLoader();

  constructor(def: any, textureDefs: any) {
    super();

    this.textures = [];

    this.uniforms = {
      textures: { value: [] },
      textureCount: { value: 0 },
      blendingMode: { value: def.blendMode },

      useBaseColor: { value: 0 },
      baseColor: { value: new Color(0, 0, 0) },
      baseAlpha: { value: 0.0 },

      indoor: { value: 0 },

      // Managed by light manager
      lightModifier: { value: 1.0 },
      ambientLight: { value: new Color(0.5, 0.5, 0.5) },
      diffuseLight: { value: new Color(0.25, 0.5, 1.0) },

      // Managed by light manager
      fogModifier: { value: 1.0 },
      fogColor: { value: new Color(0.25, 0.5, 1.0) },
      fogStart: { value: 5.0 },
      fogEnd: { value: 400.0 },
    };

    if (def.useBaseColor) {
      const baseColor = new Color(
        def.baseColor.r / 255.0,
        def.baseColor.g / 255.0,
        def.baseColor.b / 255.0,
      );

      const baseAlpha = def.baseColor.a / 255.0;

      this.uniforms.useBaseColor = { value: 1 };
      this.uniforms.baseColor = { value: baseColor };
      this.uniforms.baseAlpha = { value: baseAlpha };
    }

    // Tag lighting mode (based on group flags)
    if (def.indoor) {
      this.uniforms.indoor = { value: 1 };
    }

    // Flag 0x01 (unlit)
    // TODO: This is really only unlit at night. Needs to integrate with the light manager in
    // some fashion.
    if (def.flags & 0x10) {
      this.uniforms.lightModifier = { value: 0.0 };
    }

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

    this.vertexShader = vertexShader.default as any;
    this.fragmentShader = fragmentShader.default as any;

    this.loadTextures(textureDefs);
  }

  // TODO: Handle texture flags and color.
  public loadTextures(textureDefs: any) {
    const textures: any[] = [];

    textureDefs.forEach((textureDef: any) => {
      if (textureDef !== null) {
        const texture = this.textureLoader.load(textureDef.path, this.wrapping, this.wrapping, false);
        textures.push(texture);
      }
    });

    this.textures = textures;

    // Update shader uniforms to reflect loaded textures.
    this.uniforms.textures = { value: textures };
    this.uniforms.textureCount = { value: textures.length };
  }

  public dispose() {
    super.dispose();

    this.textures.forEach((texture) => {
      this.textureLoader.unload(texture);
    });
  }
}

export default WMOMaterial;
