
export interface ISession {
  Start(): Promise<void>;
  Stop(): Promise<void>;
}
