
export interface IAssetProvider<T> {
  start(path: string): Promise<T>;
}
