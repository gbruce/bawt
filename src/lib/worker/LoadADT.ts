import ADT = require('blizzardry/lib/adt');
import { IHttpService } from 'interface/IHttpService';
import { NewLogger } from 'bawt/utils/Logger';
import { Lock } from 'bawt/utils/Lock';

const log = NewLogger('worker/LoadDBC');

const cache: Map<string, blizzardry.IADT> = new Map();
const lock: Lock = new Lock();

export class LoadADT {
  constructor(private httpService: IHttpService) {}

  public async Start(adtPath: string, wdtFlags: any) {
    await lock.lock();

    const cached = cache.get(adtPath);
    if (cached) {
      lock.unlock();
      return cached;
    }

    log.info(`Loading ${adtPath}`);

    const adtStream = await this.httpService.get(adtPath);
    let decoded = null;
    try {
      decoded = ADT(wdtFlags).decode(adtStream);
    }
    catch (e) {
      log.error(e);
    }

    if (decoded && !cache.has(adtPath)) {
      cache.set(adtPath, decoded);
    }

    lock.unlock();

    return decoded;
  }
}
