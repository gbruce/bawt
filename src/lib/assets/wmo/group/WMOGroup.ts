import { IObject } from 'interface/IObject';
import { BufferAttribute, BufferGeometry, Mesh, Material } from 'three';

import WMOMaterial from '../material/SimpleMaterial';

export class WMOGroup extends Mesh implements IObject {
  private indoor: any;
  private animated: boolean;

  constructor(private wmo: blizzardry.IWMO, private groupId: any, private data: blizzardry.IWMOGroup) {
    super();

    this.matrixAutoUpdate = false;
    this.indoor = data.indoor;
    this.animated = false;

    const vertexCount = data.MOVT.vertices.length;
    const textureCoords = data.MOTV.textureCoords;
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const colors = new Float32Array(vertexCount * 3);
    const alphas = new Float32Array(vertexCount);

    data.MOVT.vertices.forEach((vertex: any, index: any) => {
      // Provided as (X, Z, -Y)
      positions[index * 3] = vertex[0];
      positions[index * 3 + 1] = vertex[2];
      positions[index * 3 + 2] = -vertex[1];
      // positions[index * 3] = vertex[0];
      // positions[index * 3 + 1] = vertex[1];
      // positions[index * 3 + 2] = vertex[2];

      uvs[index * 2] = textureCoords[index][0];
      uvs[index * 2 + 1] = textureCoords[index][1];
    });

    data.MONR.normals.forEach((normal: any, index: any) => {
      normals[index * 3] = normal[0];
      normals[index * 3 + 1] = normal[2];
      normals[index * 3 + 2] = -normal[1];
    });

    const baseColor = { r: 0, g: 0, b: 0};
    if (this.indoor) {
      if (wmo.MOHD.skipBaseColor) {
        baseColor.r = 0;
        baseColor.g = 0;
        baseColor.b = 0;
      }
      else {
        baseColor.r = wmo.MOHD.baseColor.r;
        baseColor.g = wmo.MOHD.baseColor.g;
        baseColor.b = wmo.MOHD.baseColor.b;
      }

      let tmpColor: number;
      let tmpColor2: number;
      let tmpBlend: number;
      const computeColor = (baseColor: number, color: number, blend: number) => {
        tmpColor = color - baseColor;
        tmpBlend = blend / 255.0;
        tmpColor = (tmpColor - tmpBlend * tmpColor);
        tmpColor2 = tmpColor * blend / 64 + tmpColor - baseColor;
        return Math.min(255.0, Math.max(tmpColor2 / 2, 0)) / 255.0;
      };
      const computeColor2 = (baseColor: number, color: number, blend: number) => {
        tmpColor = color - baseColor;
        tmpBlend = blend / 255.0;
        tmpColor += color * tmpBlend;
        tmpColor /= 2;
        return Math.min(0, Math.max(tmpColor, 255.0)) / 255.0;
      };
      
      data.MOCV.colors.forEach((color: any, index: any) => {
        colors[index * 3] = computeColor(baseColor.r, color.r, color.a);
        colors[index * 3 + 1] = computeColor(baseColor.g, color.g, color.a);
        colors[index * 3 + 2] = computeColor(baseColor.b, color.b, color.a);
        alphas[index] = 0;
      });
    }
    else {
      data.MOVT.vertices.forEach((_vertex: any, index: any) => {
        colors[index * 3] = 1.0;
        colors[index * 3 + 1] = 1.0;
        colors[index * 3 + 2] = 1.0;
        alphas[index] = 1.0;
      });
    }

    const indices = new Uint32Array(data.MOVI.triangles);

    const geometry = this.geometry = new BufferGeometry();
    geometry.setIndex(new BufferAttribute(indices, 1));
    geometry.addAttribute('position', new BufferAttribute(positions, 3));
    geometry.addAttribute('normal', new BufferAttribute(normals, 3));
    geometry.addAttribute('uv', new BufferAttribute(uvs, 2));

    // TODO: Perhaps it is possible to directly use a vec4 here? Currently, color + alpha is
    // combined into a vec4 in the material's vertex shader. For some reason, attempting to
    // directly use a BufferAttribute with a length of 4 resulted in incorrect ordering for the
    // values in the shader.
    geometry.addAttribute('color', new BufferAttribute(colors, 3));
    geometry.addAttribute('alpha', new BufferAttribute(alphas, 1));

    // Mirror geometry over X and Y axes and rotate
    // const matrix = new Matrix4();
    // matrix.makeScale(-1, -1, 1);
    // geometry.applyMatrix(matrix);
    // geometry.rotateY(-Math.PI / 2);
    // const m = terrainRotationToWorld([-90,0,0],1);
    //geometry.applyMatrix(m);
  }

  public async initialize() {
    const materialIDs: number[] = [];

    this.data.MOBA.batches.forEach((batch) => {
      materialIDs.push(batch.materialID);
    });

    const materialDefs = this.wmo.MOMT.materials;
    const texturePaths = this.wmo.MOTX.filenames;

    this.material = await this.createMultiMaterial(materialIDs, materialDefs, texturePaths);

    this.data.MOBA.batches.forEach((batch) => {
      let materialIndex = -1;
      for(let i = 0; i < (this.material as WMOMaterial[]).length; i++) {
        const material = (this.material as WMOMaterial[])[i];
        if (material.materialId === batch.materialID) {
          materialIndex = i;
          break;
        }
      }

      (this.geometry as BufferGeometry).addGroup(batch.firstIndex, batch.indexCount, materialIndex);
    });
  }

  public async createMultiMaterial(materialIDs: number[], materialDefs: any[], texturePaths: {[key: number]: string}) {
    const materials: Material[] = [];

    const materialLoaders: Promise<WMOMaterial>[] = [];
    materialIDs.forEach((materialID) => {
      const materialDef = this.wmo.MOMT.materials[materialID];
      materialLoaders.push(this.createMaterial(materialDef, texturePaths, materialID));
    });

    const loadedMaterials = await Promise.all(materialLoaders);

    for (const material of loadedMaterials) {
      materials.push(material);
    }

    return materials;
  }

  public async createMaterial(materialDef: any, texturePaths: {[key: number]: string}, materialId: any) {
    const textureDefs: any[] = [];

    materialDef.textures.forEach((textureDef: any) => {
      const texturePath = texturePaths[textureDef.offset];

      if (texturePath !== undefined) {
        textureDef.path = texturePath;
        textureDefs.push(textureDef);
      } else {
        textureDefs.push(null);
      }
    });

    const material = new WMOMaterial(materialDef, textureDefs, materialId);
    await material.initialize();

    return material;
  }

  public clone(): any {
    return new WMOGroup(this.wmo, this.groupId, this.data);
  }

  public dispose() {
    this.geometry.dispose();

    // this.material.materials.forEach((material) => {
    //  material.dispose();
    // });
  }

}

export default WMOGroup;
