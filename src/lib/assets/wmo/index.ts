import { Group } from 'three';
import { IObject } from 'interface/IObject';

export class WMO extends Group implements IObject {
  private groupCount: number;
  private groups: Map<any, any>;
  private indoorGroupIDs: number[];
  private outdoorGroupIDs: number[];

  constructor(public data: blizzardry.IWMO) {
    super();

    this.matrixAutoUpdate = false;
    this.groupCount = data.MOHD.groupCount;
    this.groups = new Map();
    this.indoorGroupIDs = [];
    this.outdoorGroupIDs = [];

    // Separate group IDs by indoor/outdoor flag. This allows us to queue outdoor groups to
    // load before indoor groups.
    for (let i = 0; i < this.groupCount; ++i) {
      const group = data.MOGI.groups[i];

      if (group.indoor) {
        this.indoorGroupIDs.push(i);
      } else {
        this.outdoorGroupIDs.push(i);
      }
    }
  }

  public async initialize() {}
  public dispose(): void {}

  public doodadSet(doodadSet: any) {
    const set = this.data.MODS.sets[doodadSet];
    const { startIndex: start, doodadCount: count  } = set;

    const entries = this.data.MODD.doodads.slice(start, start + count);

    return entries;
  }

  // public clone() {
  //  return new WMO(this.path, this.data);
  // }
}
