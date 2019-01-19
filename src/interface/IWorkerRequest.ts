export enum AssetType {
  ADT,
  DBC,
  M2,
  Texture,
  WDT,
  WMO,
  WMOGroup,
  Skin,
}

export interface IWorkerRequest {
  type: AssetType;
  path: string;
  flags?: any;
}
