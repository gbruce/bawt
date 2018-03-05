
export interface ISession {
  // config: any;
  key: number[]|null;
  account: string;
  build: number;

  Start(): void;
}
