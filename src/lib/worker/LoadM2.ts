import { Lock } from 'bawt/utils/Lock';
import { NewLogger } from 'bawt/utils/Logger';
import * as M2 from 'blizzardry/lib/m2';
import { IHttpService } from 'interface/IHttpService';

const log = NewLogger('worker/LoadM2');
const cache: Map<string, any> = new Map();
const lock: Lock = new Lock();

export class LoadM2 {
  constructor(private httpService: IHttpService) {}

  public async Start(m2Path: string) {
    await lock.lock();

    const cached = cache.get(m2Path);
    if (cached) {
      lock.unlock();
      return cached;
    }

    log.info(`Loading ${m2Path}`);
    const m2Stream = await this.httpService.get(m2Path);
    const m2 = M2.decode(m2Stream);

    if (m2) {
      cache.set(m2Path, m2);
    }

    lock.unlock();

    return m2;
  }
}
