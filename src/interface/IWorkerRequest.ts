export enum AssetType {
  ADT,
  DBC,
  M2,
  Texture,
  WDT,
  WMO,
  WMOGroup,
}

export interface IWorkerRequest {
  type: AssetType;
  path: string;
  flags?: any;
}
