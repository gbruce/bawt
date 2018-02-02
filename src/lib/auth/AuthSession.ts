import { Realm } from '../../interface/Realm';

export interface AuthSession {
  GetRealms(): Promise<Realm[]>;
}
