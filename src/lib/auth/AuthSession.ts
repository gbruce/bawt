import { IRealm } from '../../interface/Realm';

export interface AuthSession {
  GetRealms(): Promise<IRealm[]>;
}
