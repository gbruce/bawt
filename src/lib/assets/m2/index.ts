import { Group, Bone, Vector3, Skeleton, Geometry, Vector4,
  Matrix4, SkinnedMesh, Mesh, Face3, Vector2, BufferGeometry, Object3D, Quaternion } from 'three';
import { Submesh } from './Submesh';
import { Material } from './Material';
import { AnimationManager } from './AnimationManager';
import { BatchManager } from './BatchManager';
import { ISceneObject } from 'interface/ISceneObject';

interface IM2InstanceParams {
  animations: any;
  geometry: any;
  submeshGeometries: any;
  batches: any;
}

export class M2Model extends Group implements ISceneObject {
  private cache = {};
  private eventListeners: any[] = [];
  private batchManager = new BatchManager();
  private canInstance: boolean = false;
  private animated: boolean = false;
  private billboards: any[] = [];
  // Keep track of whether or not to use skinning. If the M2 has bone animations, useSkinning is
  // set to true, and all meshes and materials used in the M2 will be skinning enabled. Otherwise,
  // skinning will not be enabled. Skinning has a very significant impact on the render loop in
  // three.js.
  private useSkinning: boolean = false;
  private mesh: Mesh|null = null;
  private submeshes: any[] = [];
  private parts: Map<any, any> = new Map();
  private geometry: Geometry|null = null;
  private submeshGeometries: Map<any, any> = new Map();
  private skeleton: any = null;
  private bones: any[] = [];
  private rootBones: any[] = [];
  public animations: AnimationManager|null = null;
  private receivesAnimationUpdates: boolean = false;
  private batches: any;
  private textureAnimations: any = new Object3D();
  public uvAnimationValues: any[] = [];
  public transparencyAnimationValues: any[] = [];
  public vertexColorAnimationValues: any[] = [];

  public get object3d(): Object3D {
    return this;
  }

  constructor(public path: string,
              private data: blizzardry.IModel,
              private skinData: blizzardry.ISkin,
              private instance: IM2InstanceParams|null = null) {
    super();

    // if (this.geometry) {
    //   this.geometry.computeBoundingSphere();
    //   const mesh = new Mesh(
    //     new SphereGeometry( this.geometry.boundingSphere.radius, 20, 10 ),
    //     new MeshBasicMaterial( { color: 0x00FF00, transparent: true,
    //       opacity: 0.2, side: DoubleSide, wireframe: true }));
    //   mesh.position.copy(this.geometry.boundingSphere.center);
    //   this.add(mesh);
    // }
  }

  public async initialize() {
    this.matrixAutoUpdate = false;
    this.eventListeners = [];
    this.name = this.path.split('\\').slice(-1).pop() || '';
    this.path = this.path;

    // Instanceable M2s share geometry, texture units, and animations.
    this.canInstance = this.data.canInstance;
    this.animated = this.data.animated;

    if (this.instance) {
      this.animations = this.instance.animations;

      // To prevent over-updating animation timelines, instanced M2s shouldn't receive animation
      // time deltas. Instead, only the original M2 should receive time deltas.
      this.receivesAnimationUpdates = false;
    } else {
      this.animations = new AnimationManager(this, this.data.animations, this.data.sequences);

      if (this.animated) {
        this.receivesAnimationUpdates = true;
      } else {
        this.receivesAnimationUpdates = false;
      }
    }

    this.createSkeleton(this.data.bones);

    // Instanced M2s can share geometries and texture units.
    if (this.instance) {
      this.batches = this.instance.batches;
      this.geometry = this.instance.geometry;
      this.submeshGeometries = this.instance.submeshGeometries;
      this.geometry!.computeBoundingSphere();

    } else {
      this.createTextureAnimations(this.data);
      await this.createBatches(this.data, this.skinData);
      this.createGeometry(this.data.vertices);
    }

    this.createMesh(this.geometry, this.skeleton, this.rootBones);
    this.createSubmeshes(this.data, this.skinData);
  }

  private createSkeleton(boneDefs: blizzardry.IBone[]) {
    const rootBones: Bone[] = [];
    const bones: Bone[] = [];
    const billboards: Bone[] = [];

    for (let boneIndex = 0, len = boneDefs.length; boneIndex < len; ++boneIndex) {
      const boneDef = boneDefs[boneIndex];
      const bone = new Bone();

      bones.push(bone);

      // M2 bone positioning seems to be inverted on X and Y
      const { pivotPoint } = boneDef;
      const correctedPosition = new Vector3(-pivotPoint[0], -pivotPoint[1], pivotPoint[2]);
      bone.position.copy(correctedPosition);

      if (boneDef.parentID > -1) {
        const parent = bones[boneDef.parentID];
        parent.add(bone);

        // Correct bone positioning relative to parent
        let up = bone.parent;
        while (up) {
          bone.position.sub(up.position);
          up = up.parent;
        }
      } else {
        bone.userData.isRoot = true;
        rootBones.push(bone);
      }

      // Enable skinning support on this M2 if we have bone animations.
      if (boneDef.animated) {
        // TODO: fix skinning
        this.useSkinning = false;
      }

      // Flag billboarded bones
      if (boneDef.billboarded) {
        bone.userData.billboarded = true;
        bone.userData.billboardType = boneDef.billboardType;

        billboards.push(bone);
      }

      // Bone translation animation block
      if (boneDef.translation.animated) {
        this.animations!.registerTrack({
          target: bone,
          property: 'position',
          animationBlock: boneDef.translation,
          trackType: 'VectorKeyframeTrack',

          valueTransform: (value: any) => {
            return [
              bone.position.x + -value[0],
              bone.position.y + -value[1],
              bone.position.z + value[2],
            ];
          },
        });
      }

      // Bone rotation animation block
      if (boneDef.rotation.animated) {
        this.animations!.registerTrack({
          target: bone,
          property: 'quaternion',
          animationBlock: boneDef.rotation,
          trackType: 'QuaternionKeyframeTrack',

          valueTransform: (value: any) => {
            return [value[0], value[1], -value[2], -value[3]];
          },
        });
      }

      // Bone scaling animation block
      if (boneDef.scaling.animated) {
        this.animations!.registerTrack({
          target: bone,
          property: 'scale',
          animationBlock: boneDef.scaling,
          trackType: 'VectorKeyframeTrack',
        });
      }
    }

    // Preserve the bones
    this.bones = bones;
    this.rootBones = rootBones;
    this.billboards = billboards;

    // Assemble the skeleton
    this.skeleton = new Skeleton(bones);

    this.skeleton.matrixAutoUpdate = this.matrixAutoUpdate;
  }

  // Returns a map of M2Materials indexed by submesh. Each material represents a batch,
  // to be rendered in the order of appearance in the map's entry for the submesh index.
  private async createBatches(data: blizzardry.IModel, skinData: blizzardry.ISkin) {
    const batches = new Map();
    const batchDefs = this.batchManager.createDefs(data, skinData);
    const batchLen = batchDefs.length;
    const materialsInit: Array<Promise<void>> = [];

    for (let batchIndex = 0; batchIndex < batchLen; ++batchIndex) {
      const batchDef = batchDefs[batchIndex];

      const { submeshIndex } = batchDef;

      if (!batches.has(submeshIndex)) {
        batches.set(submeshIndex, []);
      }

      // Array that will contain materials matching each batch.
      const submeshBatches = batches.get(submeshIndex);

      // Observe the M2's skinning flag in the M2Material.
      batchDef.useSkinning = this.useSkinning;

      const batchMaterial = new Material(this, batchDef);
      submeshBatches.unshift(batchMaterial);

      materialsInit.push(batchMaterial.initialize());
    }

    await Promise.all(materialsInit);
    this.batches = batches;
  }

  private createGeometry(vertices: any[]) {
    const geometry = new Geometry();

    for (let vertexIndex = 0, len = vertices.length; vertexIndex < len; ++vertexIndex) {
      const vertex = vertices[vertexIndex];

      const { position } = vertex;

      geometry.vertices.push(
        // Provided as (X, Z, -Y)
        new Vector3(position[0], position[2], -position[1]),
      );

      geometry.skinIndices.push(
        new Vector4(...vertex.boneIndices),
      );

      geometry.skinWeights.push(
        new Vector4(...vertex.boneWeights),
      );
    }

    // Mirror geometry over X and Y axes and rotate
    // const matrix = new Matrix4();
    // matrix.makeScale(-1, -1, 1);
    // geometry.applyMatrix(matrix);
    // geometry.rotateX(-Math.PI / 2);

    // Preserve the geometry
    this.geometry = geometry;
  }

  private createMesh(geometry: any, skeleton: any, rootBones: any) {
    let mesh: Mesh;

    if (this.useSkinning) {
      mesh = new SkinnedMesh(geometry);

      // Assign root bones to mesh
      rootBones.forEach((bone: any) => {
        mesh.add(bone);
        bone.skin = mesh;
      });

      // Bind mesh to skeleton
      (mesh as SkinnedMesh).bind(skeleton);
    } else {
      mesh = new Mesh(geometry);
    }

    mesh.matrixAutoUpdate = this.matrixAutoUpdate;

    // Never display the mesh
    // TODO: We shouldn't really even have this mesh in the first place, should we?
    mesh.visible = false;

    // Add mesh to the group
    this.add(mesh);

    // Assign as root mesh
    this.mesh = mesh;
  }

  private createSubmeshes(data: blizzardry.IModel, skinData: blizzardry.ISkin) {
    const { vertices } = data;
    const { submeshes, indices, triangles } = skinData;

    const subLen = submeshes.length;

    for (let submeshIndex = 0; submeshIndex < subLen; ++submeshIndex) {
      const submeshDef = submeshes[submeshIndex];

      // Bring up relevant batches and geometry.
      const submeshBatches = this.batches.get(submeshIndex);
      const submeshGeometry = this.submeshGeometries.get(submeshIndex) ||
        this.createSubmeshGeometry(submeshDef, indices, triangles, vertices);

      const submesh = this.createSubmesh(submeshDef, submeshGeometry, submeshBatches);

      this.parts.set(submesh.userData.partID, submesh);
      this.submeshes.push(submesh);

      this.submeshGeometries.set(submeshIndex, submeshGeometry);

      // const vnh = new VertexNormalsHelper(submesh, 0.3, 0xff0000 );
      this.add(submesh);
      // this.add(vnh);
    }
  }

  private createSubmeshGeometry(submeshDef: any, indices: any, triangles: any, vertices: any) {
    if (!this.geometry) {
      return;
    }

    const geometry = this.geometry.clone();

    // TODO: Figure out why this isn't cloned by the line above
    geometry.skinIndices = Array.from(this.geometry.skinIndices);
    geometry.skinWeights = Array.from(this.geometry.skinWeights);

    const uvs: any[] = [];

    const { startTriangle: start, triangleCount: count } = submeshDef;
    for (let i = start, faceIndex = 0; i < start + count; i += 3, ++faceIndex) {
      const vindices = [
        indices[triangles[i]],
        indices[triangles[i + 1]],
        indices[triangles[i + 2]],
      ];

      const face = new Face3(vindices[0], vindices[1], vindices[2]);

      geometry.faces.push(face);

      uvs[faceIndex] = [];
      for (let vinIndex = 0, vinLen = vindices.length; vinIndex < vinLen; ++vinIndex) {
        const index = vindices[vinIndex];

        const { textureCoords, normal } = vertices[index];

        uvs[faceIndex].push(new Vector2(textureCoords[0][0], textureCoords[0][1]));

        face.vertexNormals.push(new Vector3(normal[0], normal[1], normal[2]));
      }
    }

    geometry.faceVertexUvs = [uvs];

    const bufferGeometry = new BufferGeometry().fromGeometry(geometry);

    return bufferGeometry;
  }

  private createSubmesh(submeshDef: any, geometry: any, batches: any) {
    const rootBone = this.bones[submeshDef.rootBone];

    const opts = {
      skeleton: this.skeleton,
      geometry,
      rootBone,
      useSkinning: this.useSkinning,
      matrixAutoUpdate: this.matrixAutoUpdate,
    };

    const submesh = new Submesh(opts);

    submesh.applyBatches(batches);

    submesh.userData.partID = submeshDef.partID;

    return submesh;
  }

  private createTextureAnimations(data: blizzardry.IModel) {
    const { uvAnimations, transparencyAnimations, vertexColorAnimations } = data;

    this.createUVAnimations(uvAnimations);
    this.createTransparencyAnimations(transparencyAnimations);
    this.createVertexColorAnimations(vertexColorAnimations);
  }

  // TODO: Add support for rotation and scaling in UV animations.
  private createUVAnimations(uvAnimationDefs: any[]) {
    if (uvAnimationDefs.length === 0) {
      return;
    }

    uvAnimationDefs.forEach((uvAnimationDef, index) => {
      // Default value
      this.uvAnimationValues[index] = {
        translation: [1.0, 1.0, 1.0],
        rotation: [0.0, 0.0, 0.0, 1.0],
        scaling: [1.0, 1.0, 1.0],
        matrix: new Matrix4(),
      };

      const { translation } = uvAnimationDef;

      this.animations!.registerTrack({
        target: this,
        property: 'uvAnimationValues[' + index + '].translation',
        animationBlock: translation,
        trackType: 'VectorKeyframeTrack',
      });

      // Set up event subscription to produce matrix from translation, rotation, and scaling
      // values.
      const updater = () => {
        const animationValue = this.uvAnimationValues[index];

        // Set up matrix for use in uv transform in vertex shader.
        animationValue.matrix = new Matrix4().compose(
          new Vector3(...animationValue.translation),
          new Quaternion(...animationValue.rotation),
          new Vector3(...animationValue.scaling),
        );
      };

      // this.animations.on('update', updater);
      this.animations!.onUpdate.subscribe(() => updater());

      this.eventListeners.push([this.animations, 'update', updater]);
    });
  }

  private createTransparencyAnimations(transparencyAnimationDefs: blizzardry.IAnimationBlock[]) {
    if (transparencyAnimationDefs.length === 0) {
      return;
    }

    transparencyAnimationDefs.forEach((transparencyAnimationDef, index) => {
      // Default value
      this.transparencyAnimationValues[index] = 1.0;

      this.animations!.registerTrack({
        target: this,
        property: 'transparencyAnimationValues[' + index + ']',
        animationBlock: transparencyAnimationDef,
        trackType: 'NumberKeyframeTrack',

        valueTransform: (value: any) => {
          return [value];
        },
      });
    });
  }

  private createVertexColorAnimations(vertexColorAnimationDefs: any[]) {
    if (vertexColorAnimationDefs.length === 0) {
      return;
    }

    vertexColorAnimationDefs.forEach((vertexColorAnimationDef, index) => {
      // Default value
      this.vertexColorAnimationValues[index] = {
        color: [1.0, 1.0, 1.0],
        alpha: 1.0,
      };

      const { color, alpha } = vertexColorAnimationDef;

      this.animations!.registerTrack({
        target: this,
        property: 'vertexColorAnimationValues[' + index + '].color',
        animationBlock: color,
        trackType: 'VectorKeyframeTrack',
      });

      this.animations!.registerTrack({
        target: this,
        property: 'vertexColorAnimationValues[' + index + '].alpha',
        animationBlock: alpha,
        trackType: 'NumberKeyframeTrack',

        valueTransform: (value: any) => {
          return [value];
        },
      });
    });
  }

  private applyBillboards(camera: any) {
    for (let i = 0, len = this.billboards.length; i < len; ++i) {
      const bone = this.billboards[i];

      switch (bone.userData.billboardType) {
        case 0:
          this.applySphericalBillboard(camera, bone);
          break;
        case 3:
          this.applyCylindricalZBillboard(camera, bone);
          break;
        default:
          break;
      }
    }
  }

  private applySphericalBillboard(camera: any, bone: any) {
    const boneRoot = bone.skin;

    if (!boneRoot) {
      return;
    }

    const camPos = this.worldToLocal(camera.position.clone());

    const modelForward = new Vector3(camPos.x, camPos.y, camPos.z);
    modelForward.normalize();

    const modelVmEl = boneRoot.modelViewMatrix.elements;
    const modelRight = new Vector3(modelVmEl[0], modelVmEl[4], modelVmEl[8]);
    modelRight.multiplyScalar(-1);

    const modelUp = new Vector3();
    modelUp.crossVectors(modelForward, modelRight);
    modelUp.normalize();

    const rotateMatrix = new Matrix4();

    rotateMatrix.set(
      modelForward.x,   modelRight.x,   modelUp.x,  0,
      modelForward.y,   modelRight.y,   modelUp.y,  0,
      modelForward.z,   modelRight.z,   modelUp.z,  0,
      0,                0,              0,          1,
    );

    bone.rotation.setFromRotationMatrix(rotateMatrix);
  }

  private applyCylindricalZBillboard(camera: any, bone: any) {
    const boneRoot = bone.skin;

    if (!boneRoot) {
      return;
    }

    const camPos = this.worldToLocal(camera.position.clone());

    const modelForward = new Vector3(camPos.x, camPos.y, camPos.z);
    modelForward.normalize();

    const modelVmEl = boneRoot.modelViewMatrix.elements;
    const modelRight = new Vector3(modelVmEl[0], modelVmEl[4], modelVmEl[8]);

    const modelUp = new Vector3(0, 0, 1);

    const rotateMatrix = new Matrix4();

    rotateMatrix.set(
      modelForward.x,   modelRight.x,   modelUp.x,  0,
      modelForward.y,   modelRight.y,   modelUp.y,  0,
      modelForward.z,   modelRight.z,   modelUp.z,  0,
      0,                0,              0,          1,
    );

    bone.rotation.setFromRotationMatrix(rotateMatrix);
  }

  set displayInfo(displayInfo: any) {
    for (let i = 0, len = this.submeshes.length; i < len; ++i) {
      this.submeshes[i].displayInfo = displayInfo;
    }
  }

  private detachEventListeners() {
    this.eventListeners.forEach((entry) => {
      const [target, event, listener] = entry;
      target.removeListener(event, listener);
    });
  }

  public dispose() {
    this.detachEventListeners();
    this.eventListeners = [];

    if (this.geometry){
      this.geometry.dispose();
    }
    if (this.mesh) {
      this.mesh.geometry.dispose();
    }

    this.submeshes.forEach((submesh) => {
      submesh.dispose();
    });
  }

  public cloneM2() {
    return new M2Model(this.path, this.data, this.skinData,
      this.canInstance ? {
        animations: this.animations,
        geometry: this.geometry,
        submeshGeometries: this.submeshGeometries,
        batches: this.batches,
      } : null);
  }
}
