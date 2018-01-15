
export interface Factory<T> {
  Create(...args: any[]): T;
}
