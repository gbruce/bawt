import { Mesh, BufferGeometry, BufferAttribute, Matrix4, MultiMaterial } from 'three';

import WMOMaterial from '../material/WMOMaterial';

export class WMOGroup extends Mesh {
  private indoor: any;
  private animated: boolean;

  constructor(private wmo: any, private groupId: any, private data: any, private path: any) {
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

      uvs[index * 2] = textureCoords[index][0];
      uvs[index * 2 + 1] = textureCoords[index][1];
    });

    data.MONR.normals.forEach((normal: any, index: any) => {
      normals[index * 3] = normal[0];
      normals[index * 3 + 1] = normal[2];
      normals[index * 3 + 2] = -normal[1];
    });

    if ('MOCV' in data) {
      data.MOCV.colors.forEach((color: any, index: any) => {
        colors[index * 3] = color.r / 255.0;
        colors[index * 3 + 1] = color.g / 255.0;
        colors[index * 3 + 2] = color.b / 255.0;
        alphas[index] = color.a / 255.0;
      });
    } else if (this.indoor) {
      // Default indoor vertex color: rgba(0.5, 0.5, 0.5, 1.0)
      data.MOVT.vertices.forEach((_vertex: any, index: any) => {
        colors[index * 3] = 127.0 / 255.0;
        colors[index * 3 + 1] = 127.0 / 255.0;
        colors[index * 3 + 2] = 127.0 / 255.0;
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
    const matrix = new Matrix4();
    matrix.makeScale(-1, -1, 1);
    geometry.applyMatrix(matrix);
    geometry.rotateX(-Math.PI / 2);

    const materialIDs: any[] = [];

    data.MOBA.batches.forEach((batch: any) => {
      materialIDs.push(batch.materialID);
      geometry.addGroup(batch.firstIndex, batch.indexCount, batch.materialID);
    });

    const materialDefs = this.wmo.MOMT.materials;
    const texturePaths = this.wmo.MOTX.filenames;

    this.material = this.createMultiMaterial(materialIDs, materialDefs, texturePaths);
  }

  public createMultiMaterial(materialIDs: any[], materialDefs: any[], texturePaths: any[]) {
    const multiMaterial = new MultiMaterial();

    materialIDs.forEach((materialID) => {
      const materialDef = materialDefs[materialID];

      if (this.indoor) {
        materialDef.indoor = true;
      } else {
        materialDef.indoor = false;
      }

      if (!this.wmo.MOHD.skipBaseColor) {
        materialDef.useBaseColor = true;
        materialDef.baseColor = this.wmo.MOHD.baseColor;
      } else {
        materialDef.useBaseColor = false;
      }

      const material = this.createMaterial(materialDefs[materialID], texturePaths);

      multiMaterial.materials[materialID] = material;
    });

    return multiMaterial;
  }

  public createMaterial(materialDef: any, texturePaths: any[]) {
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

    const material = new WMOMaterial(materialDef, textureDefs);

    return material;
  }

  public clone(): any {
    return new WMOGroup(this.wmo, this.groupId, this.data, this.path);
  }

  public dispose() {
    this.geometry.dispose();

    // this.material.materials.forEach((material) => {
    //  material.dispose();
    // });
  }

}

export default WMOGroup;
