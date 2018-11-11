import { Group } from 'three';

export class WMO extends Group {
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
