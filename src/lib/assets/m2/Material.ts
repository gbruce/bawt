
import { ShaderMaterial, Vector3, Matrix4, Color, BackSide, DoubleSide,
  CustomBlending, NoBlending, OneFactor, ZeroFactor, SrcAlphaFactor,
  OneMinusSrcAlphaFactor, SrcColorFactor, DstColorFactor, DstAlphaFactor,
  RepeatWrapping } from 'three';
import { TextureLoader } from './TextureLoader';
import vertexShader = require('./shader.vert');
import fragmentShader = require('./shader.frag');

export class Material extends ShaderMaterial {
  private m2: any;
  private shaderID: any;
  private skins: any;
  private textures: any[];
  private textureDefs: any;
  private eventListeners: any[];
  private textureLoader: TextureLoader;

  constructor(m2: any, def: any) {
    if (def.useSkinning) {
      super({ skinning: true });
    } else {
      super({ skinning: false });
    }

    this.m2 = m2;
    this.textureLoader = new TextureLoader();
    this.eventListeners = [];

    const vertexShaderMode = this.vertexShaderModeFromID(def.shaderID, def.opCount);
    const fragmentShaderMode = this.fragmentShaderModeFromID(def.shaderID, def.opCount);

    this.uniforms = {
      textureCount: {value: 0 },
      textures: { value: [] },

      blendingMode: { value: 0 },
      vertexShaderMode: { value: vertexShaderMode },
      fragmentShaderMode: { value: fragmentShaderMode },

      billboarded: { value: 0.0 },

      // Animated vertex colors
      animatedVertexColorRGB: { value: new Vector3(1.0, 1.0, 1.0) },
      animatedVertexColorAlpha: { value: 1.0 },

      // Animated transparency
      animatedTransparency: { value: 1.0 },

      // Animated texture coordinate transform matrices
      animatedUVs: {
        value: [
          new Matrix4(),
          new Matrix4(),
          new Matrix4(),
          new Matrix4(),
        ],
      },

      // Managed by light manager
      lightModifier: { value: '1.0' },
      ambientLight: { value: new Color(0.5, 0.5, 0.5) },
      diffuseLight: { value: new Color(0.25, 0.5, 1.0) },

      // Managed by light manager
      fogModifier: { value: '1.0' },
      fogColor: { value: new Color(0.25, 0.5, 1.0) },
      fogStart: { value: 5.0 },
      fogEnd: { value: 400.0 },
    };

    this.vertexShader = vertexShader as any;
    this.fragmentShader = fragmentShader as any;

    this.applyRenderFlags(def.renderFlags);
    this.applyBlendingMode(def.blendingMode);

    // Shader ID is a masked int that determines mode for vertex and fragment shader.
    this.shaderID = def.shaderID;

    // Loaded by calling updateSkinTextures()
    this.skins = {};
    this.skins.skin1 = null;
    this.skins.skin2 = null;
    this.skins.skin3 = null;

    this.textures = [];
    this.textureDefs = def.textures;
    this.loadTextures();

    this.registerAnimations(def);
  }

  private vertexShaderModeFromID(shaderID: any, opCount: any) {
    if (opCount === 1) {
      return 0;
    }

    if (shaderID === 0) {
      return 1;
    }

    return -1;
  }

  private fragmentShaderModeFromID(shaderID: any, opCount: any) {
    if (opCount === 1) {
      // fragCombinersWrath1Pass
      return 0;
    }

    if (shaderID === 0) {
      // fragCombinersWrath2Pass
      return 1;
    }

    // Unknown / unhandled
    return -1;
  }

  private enableBillboarding() {
    // TODO: Make billboarding happen in the vertex shader.
    this.uniforms.billboarded = { value: '1.0' };

    // TODO: Shouldn't this be FrontSide? Billboarding logic currently seems to flips the mesh
    // backward.
    this.side = BackSide;
  }

  private applyRenderFlags(renderFlags: any) {
    // Flag 0x01 (unlit)
    if (renderFlags & 0x01) {
      this.uniforms.lightModifier = { value: '0.0' };
    }

    // Flag 0x02 (unfogged)
    if (renderFlags & 0x02) {
      this.uniforms.fogModifier = { value: '0.0' };
    }

    // Flag 0x04 (no backface culling)
    if (renderFlags & 0x04) {
      this.side = DoubleSide;
      this.transparent = true;
    }

    // Flag 0x10 (no z-buffer write)
    if (renderFlags & 0x10) {
      this.depthWrite = false;
    }
  }

  private applyBlendingMode(blendingMode: any) {
    this.uniforms.blendingMode.value = blendingMode;

    if (blendingMode === 1) {
      this.uniforms.alphaKey = { value: 1.0 };
    } else {
      this.uniforms.alphaKey = { value: 0.0 };
    }

    if (blendingMode >= 1) {
      this.transparent = true;
      this.blending = CustomBlending;
    }

    switch (blendingMode) {
      case 0:
        this.blending = NoBlending;
        this.blendSrc = OneFactor;
        this.blendDst = ZeroFactor;
        break;

      case 1:
        this.alphaTest = 0.5;
        this.side = DoubleSide;

        this.blendSrc = OneFactor;
        this.blendDst = ZeroFactor;
        this.blendSrcAlpha = OneFactor;
        this.blendDstAlpha = ZeroFactor;
        break;

      case 2:
        this.blendSrc = SrcAlphaFactor;
        this.blendDst = OneMinusSrcAlphaFactor;
        this.blendSrcAlpha = SrcAlphaFactor;
        this.blendDstAlpha = OneMinusSrcAlphaFactor;
        break;

      case 3:
        this.blendSrc = SrcColorFactor;
        this.blendDst = DstColorFactor;
        this.blendSrcAlpha = SrcAlphaFactor;
        this.blendDstAlpha = DstAlphaFactor;
        break;

      case 4:
        this.blendSrc = SrcAlphaFactor;
        this.blendDst = OneFactor;
        this.blendSrcAlpha = SrcAlphaFactor;
        this.blendDstAlpha = OneFactor;
        break;

      case 5:
        this.blendSrc = DstColorFactor;
        this.blendDst = ZeroFactor;
        this.blendSrcAlpha = DstAlphaFactor;
        this.blendDstAlpha = ZeroFactor;
        break;

      case 6:
        this.blendSrc = DstColorFactor;
        this.blendDst = SrcColorFactor;
        this.blendSrcAlpha = DstAlphaFactor;
        this.blendDstAlpha = SrcAlphaFactor;
        break;

      default:
        break;
    }
  }

  private loadTextures() {
    const textureDefs: any[] = this.textureDefs;

    const textures: any[] = [];

    textureDefs.forEach((textureDef) => {
      textures.push(this.loadTexture(textureDef));
    });

    this.textures = textures;

    // Update shader uniforms to reflect loaded textures.
    this.uniforms.textures = { value: textures };
    this.uniforms.textureCount = { value: textures.length };
  }

  private loadTexture(textureDef: any) {
    const wrapS = RepeatWrapping;
    const wrapT = RepeatWrapping;
    const flipY = false;

    let path = null;

    switch (textureDef.type) {
      case 0:
        // Hardcoded texture
        path = textureDef.filename;
        break;

      case 11:
        if (this.skins.skin1) {
          path = this.skins.skin1;
        }
        break;

      case 12:
        if (this.skins.skin2) {
          path = this.skins.skin2;
        }
        break;

      case 13:
        if (this.skins.skin3) {
          path = this.skins.skin3;
        }
        break;

      default:
        break;
    }

    if (path) {
      return this.textureLoader.load(path, wrapS, wrapT, flipY);
    } else {
      return null;
    }
  }

  private registerAnimations(def: any) {
    const { uvAnimationIndices, transparencyAnimationIndex, vertexColorAnimationIndex } = def;

    this.registerUVAnimations(uvAnimationIndices);
    this.registerTransparencyAnimation(transparencyAnimationIndex);
    this.registerVertexColorAnimation(vertexColorAnimationIndex);
  }

  private registerUVAnimations(uvAnimationIndices: any) {
    if (uvAnimationIndices.length === 0) {
      return;
    }

    const { animations, uvAnimationValues } = this.m2;

    const updater = () => {
      uvAnimationIndices.forEach((uvAnimationIndex: number, opIndex: number) => {
        const target = this.uniforms.animatedUVs;
        const source = uvAnimationValues[uvAnimationIndex];

        target.value[opIndex] = source.matrix;
      });
    };

    //animations.on('update', updater);
    animations.onUpdate.subscribe(() => updater());

    this.eventListeners.push([animations, 'update', updater]);
  }

  private registerTransparencyAnimation(transparencyAnimationIndex: any) {
    if (transparencyAnimationIndex === null || transparencyAnimationIndex === -1) {
      return;
    }

    const { animations, transparencyAnimationValues } = this.m2;

    const target = this.uniforms.animatedTransparency;
    const source = transparencyAnimationValues;
    const valueIndex = transparencyAnimationIndex;

    const updater = () => {
      target.value = source[valueIndex];
    };

    // animations.on('update', updater);
    animations.onUpdate.subscribe(() => updater());

    // this.eventListeners.push([animations, 'update', updater]);
  }

  private registerVertexColorAnimation(vertexColorAnimationIndex: any) {
    if (vertexColorAnimationIndex === null || vertexColorAnimationIndex === -1) {
      return;
    }

    const { animations, vertexColorAnimationValues } = this.m2;

    const targetRGB = this.uniforms.animatedVertexColorRGB;
    const targetAlpha = this.uniforms.animatedVertexColorAlpha;
    const source = vertexColorAnimationValues;
    const valueIndex = vertexColorAnimationIndex;

    const updater = () => {
      targetRGB.value = source[valueIndex].color;
      targetAlpha.value = source[valueIndex].alpha;
    };

    //animations.on('update', updater);
    animations.onUpdate.subscribe(() => updater());


    this.eventListeners.push([animations, 'update', updater]);
  }

  private detachEventListeners() {
    this.eventListeners.forEach((entry) => {
      const [target, event, listener] = entry;
      target.removeListener(event, listener);
    });
  }

  private updateSkinTextures(skin1: any, skin2: any, skin3: any) {
    this.skins.skin1 = skin1;
    this.skins.skin2 = skin2;
    this.skins.skin3 = skin3;

    this.loadTextures();
  }

  public dispose() {
    super.dispose();

    this.detachEventListeners();
    this.eventListeners = [];

    this.textures.forEach((texture) => {
      this.textureLoader.unload(texture);
    });
  }
}
