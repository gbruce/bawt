import { IDoodadCollection } from 'bawt/game/DoodadLoader';
import { NewLogger } from 'bawt/utils/Logger';
import { inject, injectable } from 'inversify';
import { Observable } from 'rxjs';
import { Object3D, Octree, Vector3, SphereGeometry, Mesh, MeshBasicMaterial, DoubleSide } from 'three';
import octree = require('three-octree');
import { IStep } from 'bawt/utils/Step';
import { ILocation } from 'bawt/game/PlayerState';
import { CopyToVector3 } from 'bawt/utils/Math';
import { M2Model } from 'bawt/assets/m2';

const log = NewLogger('game/DoodadVisibility');
const radius = 150;

declare module 'three' {
  interface ISearchResult {
    node: any;
    object: Object3D;
    position: Vector3;
    positionLast: Vector3;
    radius: number;
  }

  class Octree {
    constructor(options?: {
      radius?: number,
      undeferred?: boolean,
      depthMax?: number,
      objectsThreshold?: number,
      overlapPct?: number,
      scene?: any,
    });

    public add(object: Object3D, options?: {useFaces: boolean, useVertices: boolean}): void;
    public remove(object: any): void;
    public update(): void;
    public rebuild(): void;
    public search(position: Vector3, radius: number, organizebyhObject?: boolean): ISearchResult[];
  }
}

@injectable()
export class DoodadVisibility {
  public root: Object3D = new Object3D();
  private debugRoot: Object3D = new Object3D();
  private doodadRoot: Object3D = new Object3D();
  private octree: Octree;
  private recomputeVis: boolean = true;
  private position: Vector3 = new Vector3(0, 0, 0);
  private visibleNodes: Object3D[] = [];
  private searchMesh: Mesh;

  constructor(@inject('Observable<IDoodadCollection>') private doodadColl: Observable<IDoodadCollection>,
              @inject('Observable<IStep>') private step: Observable<IStep>,
              @inject('Observable<ILocation>') private location: Observable<ILocation>) {
    const x = (octree as any);
    this.octree = new Octree({undeferred: true, objectsThreshold: 2});
    this.searchMesh = new Mesh(
      new SphereGeometry( radius, 50, 30 ),
      new MeshBasicMaterial( { color: 0x00FF00, transparent: true, opacity: 0.2, side: DoubleSide, wireframe: true }));
    // this.debugRoot.add(this.searchMesh);
    this.root.add(this.debugRoot);
    this.root.add(this.doodadRoot);

    this.doodadColl.subscribe({ next: this.onDoodadCollChanged });
    this.step.subscribe({ next: this.onStep});
    this.location.subscribe({ next: this.onLocationChanged});
  }

  private onDoodadCollChanged = async (collection: IDoodadCollection) => {
    for (const doodad of collection.added) {
      const obj = doodad.model.object3d as M2Model;
      obj.name = doodad.id.toString();
      obj.visible = false;

      this.doodadRoot.add(obj);
      this.octree.add(obj);
      log.info(`added doodad ${obj.name} ${this.root.children.length}`);
      this.recomputeVis = true;
    }

    for (const deleted of collection.deleted) {
      const obj = this.root.getObjectByName(deleted.toString());
      if (obj) {
        obj.visible = false;
        this.doodadRoot.remove(obj);
        this.octree.remove(obj);
        log.info(`removed doodad ${obj.name} ${this.root.children.length}`);
      }
    }
  }

  private onLocationChanged = (location: ILocation) => {
    CopyToVector3(location.position, this.position);
    this.searchMesh.position.copy(this.position);
    this.recomputeVis = true;
  }

  private onStep = (step: IStep) => {
    if (this.recomputeVis) {
      for (const hide of this.doodadRoot.children) {
        hide.visible = false;
      }
      this.visibleNodes = [];

      const results = this.octree.search(this.position, radius);
      for (const result of results) {
        const distance = new Vector3().copy(result.position).sub(this.position).length();
        if (distance < (radius + result.radius)) {
          result.object.visible = true;
          this.visibleNodes.push(result.object);
        }
      }

      this.recomputeVis = false;
    }
  }
}
