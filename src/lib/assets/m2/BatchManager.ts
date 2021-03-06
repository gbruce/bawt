import { IObject } from 'interface/IObject';

export interface IBatchDesc {
  flags: number;
  shaderID: number;
  opCount: number;
  textureMapping: number;
  renderFlags: number;
  blendingMode: number;
  textures: blizzardry.ITexture[];
  textureIndices: any[];
  uvAnimations: any[];
  uvAnimationIndices: any[];
  transparencyAnimation: blizzardry.IAnimationBlock|null;
  transparencyAnimationIndex: number;
  vertexColorAnimation: any;
  vertexColorAnimationIndex: number;
  submeshIndex: number;
  layer: number;
  useSkinning: boolean;
}

export class BatchManager implements IObject {

  public async initialize() {}
  public dispose() {}
  public createDefs(model: blizzardry.IModel, skin: blizzardry.ISkin): IBatchDesc[] {
    const defs: IBatchDesc[] = [];

    skin.batches.forEach((batchData) => {
      const def = this.createDef(model, batchData);
      defs.push(def);
    });

    return defs;
  }

  public createDef(model: blizzardry.IModel, batchData: blizzardry.IBatch) {
    const def = this.stubDef();

    const { textures } = model;
    const { vertexColorAnimations, transparencyAnimations, uvAnimations } = model;

    if (!batchData.textureIndices) {
      this.resolveTextureIndices(model, batchData);
    }

    if (!batchData.uvAnimationIndices) {
      this.resolveUVAnimationIndices(model, batchData);
    }

    const { opCount } = batchData;
    const { textureMappingIndex, materialIndex } = batchData;
    const { vertexColorAnimationIndex, transparencyAnimationLookup } = batchData;
    const { textureIndices, uvAnimationIndices } = batchData;

    // Batch flags
    def.flags = batchData.flags;

    // Submesh index and batch layer
    def.submeshIndex = batchData.submeshIndex;
    def.layer = batchData.layer;

    // Op count and shader ID
    def.opCount = batchData.opCount;
    def.shaderID = batchData.shaderID;

    // Texture mapping
    // -1 => Env; 0 => T1; 1 => T2
    if (textureMappingIndex >= 0) {
      const textureMapping = model.textureMappings[textureMappingIndex];
      def.textureMapping = textureMapping;
    }

    // Material (render flags and blending mode)
    const material = model.materials[materialIndex];
    def.renderFlags = material.renderFlags;
    def.blendingMode = material.blendingMode;

    // Vertex color animation block
    if (vertexColorAnimationIndex > -1 && vertexColorAnimations[vertexColorAnimationIndex]) {
      const vertexColorAnimation = vertexColorAnimations[vertexColorAnimationIndex];
      def.vertexColorAnimation = vertexColorAnimation;
      def.vertexColorAnimationIndex = vertexColorAnimationIndex;
    }

    // Transparency animation block
    // TODO: Do we load multiple values based on opCount?
    const transparencyAnimationIndex = model.transparencyAnimationLookups[transparencyAnimationLookup];
    if (transparencyAnimationIndex > -1 && transparencyAnimations[transparencyAnimationIndex]) {
      const transparencyAnimation = transparencyAnimations[transparencyAnimationIndex];
      if (transparencyAnimation) {
        def.transparencyAnimation = transparencyAnimation;
        def.transparencyAnimationIndex = transparencyAnimationIndex;
      }
    }

    for (let opIndex = 0; opIndex < def.opCount; ++opIndex) {
      // Texture
      const textureIndex = textureIndices[opIndex];
      const texture = textures[textureIndex];
      if (texture) {
        def.textures[opIndex] = texture;
        def.textureIndices[opIndex] = textureIndex;
      }

      // UV animation block
      const uvAnimationIndex = uvAnimationIndices[opIndex];
      const uvAnimation = uvAnimations[uvAnimationIndex];
      if (uvAnimation) {
        def.uvAnimations[opIndex] = uvAnimation;
        def.uvAnimationIndices[opIndex] = uvAnimationIndex;
      }
    }

    return def;
  }

  private resolveTextureIndices(model: blizzardry.IModel, batchData: blizzardry.IBatch) {
    batchData.textureIndices = [];

    for (let opIndex = 0; opIndex < batchData.opCount; opIndex++) {
      const textureIndex = model.textureLookups[batchData.textureLookup + opIndex];
      batchData.textureIndices.push(textureIndex);
    }
  }

  private resolveUVAnimationIndices(model: blizzardry.IModel, batchData: blizzardry.IBatch) {
    batchData.uvAnimationIndices = [];

    for (let opIndex = 0; opIndex < batchData.opCount; opIndex++) {
      const uvAnimationIndex = model.uvAnimationLookups[batchData.uvAnimationLookup + opIndex];
      batchData.uvAnimationIndices.push(uvAnimationIndex);
    }
  }

  private stubDef() {
    const def: IBatchDesc = {
      flags: 0,
      shaderID: 0,
      opCount: 0,
      textureMapping: 0,
      renderFlags: 0,
      blendingMode: 0,
      textures: [],
      textureIndices: [],
      uvAnimations: [],
      uvAnimationIndices: [],
      transparencyAnimation: null,
      transparencyAnimationIndex: 0,
      vertexColorAnimation: null,
      vertexColorAnimationIndex: 0,
      submeshIndex: 0,
      layer: 0,
      useSkinning: false,
    };

    return def;
  }
}
