
export interface IObject {
  initialize(): Promise<void>;
  dispose(): void;
}
