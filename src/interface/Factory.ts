
export interface IFactory<T> {
  Create(...args: any[]): T;
}
