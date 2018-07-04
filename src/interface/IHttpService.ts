import { DecodeStream } from 'blizzardry/lib/restructure';

export interface IHttpService {
  get(path: string): Promise<DecodeStream>;
  getString(path: string): Promise<string>;
  urlFromPath(path: string): string;
}
