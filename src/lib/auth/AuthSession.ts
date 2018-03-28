import { IRealm } from 'interface/IRealm';

export interface IAuthSession {
  GetRealms(): Promise<IRealm[]>;
}
