import * as M2 from 'blizzardry/lib/m2';
import * as Skin from 'blizzardry/lib/m2/skin';
import { IObject } from 'interface/IObject';

export class BatchManager implements IObject {

  public async initialize() {}
  public dispose() {}
  public createDefs(model: M2.IModel, skin: Skin.ISkin) {
    const defs: any[] = [];

    skin.batches.forEach((batchData) => {
      const def = this.createDef(model, batchData);
      defs.push(def);
    });

    return defs;
  }

  public createDef(model: M2.IModel, batchData: Skin.IBatch) {
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

  private resolveTextureIndices(model: M2.IModel, batchData: Skin.IBatch) {
    batchData.textureIndices = [];

    for (let opIndex = 0; opIndex < batchData.opCount; opIndex++) {
      const textureIndex = model.textureLookups[batchData.textureLookup + opIndex];
      batchData.textureIndices.push(textureIndex);
    }
  }

  private resolveUVAnimationIndices(model: M2.IModel, batchData: Skin.IBatch) {
    batchData.uvAnimationIndices = [];

    for (let opIndex = 0; opIndex < batchData.opCount; opIndex++) {
      const uvAnimationIndex = model.uvAnimationLookups[batchData.uvAnimationLookup + opIndex];
      batchData.uvAnimationIndices.push(uvAnimationIndex);
    }
  }

  private stubDef() {
    const def = {
      flags: 0,
      shaderID: 0,
      opCount: 0,
      textureMapping: 0,
      renderFlags: 0,
      blendingMode: 0,
      textures: [] as any[],
      textureIndices: [] as any[],
      uvAnimations: [] as any[],
      uvAnimationIndices: [] as any[],
      transparencyAnimation: {},
      transparencyAnimationIndex: 0,
      vertexColorAnimation: null,
      vertexColorAnimationIndex: 0,
      submeshIndex: 0,
      layer: 0,
    };

    return def;
  }
}
