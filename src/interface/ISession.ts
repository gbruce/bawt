
export interface ISession {
  // config: any;
  key: number[]|null;
  account: string;
  build: number;

  Start(): Promise<void>;
  Stop(): Promise<void>;
}
