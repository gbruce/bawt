import { IRealm } from '../../interface/Realm';

export interface IAuthSession {
  GetRealms(): Promise<IRealm[]>;
}
