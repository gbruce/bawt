import { DecodeStream } from 'blizzardry/lib/restructure';

export interface IHttpService {
  get(path: string): Promise<DecodeStream>;
}
