import { SkinnedMesh, Mesh, Group } from 'three';
import { IObject } from 'interface/IObject';

export class Submesh extends Group implements IObject {
  private useSkinning: boolean;
  private rootBone: any;
  private billboarded: boolean = false;
  private skeleton: any;
  private geometry: any;

  constructor(opts: any) {
    super();

    this.matrixAutoUpdate = opts.matrixAutoUpdate;
    this.useSkinning = opts.useSkinning;
    if (this.useSkinning) {
      // Preserve the rootBone for the submesh such that its skin property can be assigned to the
      // first child batch mesh.
      this.rootBone = opts.rootBone;
      this.billboarded = opts.rootBone.userData.billboarded;
      // Preserve the skeleton for use in applying batches.
      this.skeleton = opts.skeleton;
    }

    // Preserve the geometry for use in applying batches.
    this.geometry = opts.geometry;
  }

  public async initialize() {}
  // Submeshes get one mesh per batch, which allows them to effectively simulate multiple
  // render passes. Batch mesh rendering order should be handled properly by the three.js
  // renderer.
  public applyBatches(batches: any) {
    this.clearBatches();

    const batchLen = batches.length;
    for (let batchIndex = 0; batchIndex < batchLen; ++batchIndex) {
      const batchMaterial = batches[batchIndex];

      // If the submesh is billboarded, flag the material as billboarded.
      if (this.billboarded) {
        batchMaterial.enableBillboarding();
      }

      let batchMesh;

      // Only use a skinned mesh if the submesh uses skinning.
      if (this.useSkinning) {
        batchMesh = new SkinnedMesh(this.geometry, batchMaterial);
        batchMesh.bind(this.skeleton);
      } else {
        batchMesh = new Mesh(this.geometry, batchMaterial);
      }

      batchMesh.matrixAutoUpdate = this.matrixAutoUpdate;

      this.add(batchMesh);
    }

    if (this.useSkinning) {
      this.rootBone.skin = this.children[0];
    }
  }

  // Remove any existing child batch meshes.
  private clearBatches() {
    const childrenLength = this.children.length;
    for (let childIndex = 0; childIndex < childrenLength; ++childIndex) {
      const child = this.children[childIndex];
      this.remove(child);
    }

    if (this.useSkinning) {
      // If all batch meshes are cleared, there is no longer a skin to associate with the
      // root bone.
      this.rootBone.skin = null;
    }
  }

  public dispose() {
  }

  set displayInfo(displayInfo: any) {
    const { path } = displayInfo.modelData;

    const skin1 = `${path}${displayInfo.skin1}.blp`;
    const skin2 = `${path}${displayInfo.skin2}.blp`;
    const skin3 = `${path}${displayInfo.skin3}.blp`;

    const childrenLength = this.children.length;
    for (let childIndex = 0; childIndex < childrenLength; ++childIndex) {
      const child = this.children[childIndex] as any;
      child.material.updateSkinTextures(skin1, skin2, skin3);
    }
  }
}
