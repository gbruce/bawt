import * as WMO from 'blizzardry/lib/wmo';
import { IHttpService } from 'interface/IHttpService';
import { NewLogger } from 'bawt/utils/Logger';
import { Lock } from 'bawt/utils/Lock';

const log = NewLogger('worker/LoadDBC');

const cache: Map<string, blizzardry.IWMO> = new Map();
const lock: Lock = new Lock();

export class LoadWMO {
  constructor(private httpService: IHttpService) {}

  public async Start(wmoPath: string): Promise<blizzardry.IWMO|null> {
    await lock.lock();

    const cached = cache.get(wmoPath);
    if (cached) {
      lock.unlock();
      return cached;
    }

    log.info(`Loading ${wmoPath}`);

    const wmoStream = await this.httpService.get(wmoPath);
    let decoded: blizzardry.IWMO|null = null;
    try {
      decoded = WMO.decode(wmoStream);
    }
    catch (e) {
      log.error(e);
    }

    if (decoded) {
      (decoded as any).filename = wmoPath;
    }

    if (decoded && !cache.has(wmoPath)) {
      cache.set(wmoPath, decoded);
    }

    lock.unlock();
    
    return decoded;
  }
}
