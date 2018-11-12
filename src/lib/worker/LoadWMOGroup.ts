import * as WMOGroup from 'blizzardry/lib/wmo/group';
import { IHttpService } from 'interface/IHttpService';
import { NewLogger } from 'bawt/utils/Logger';
import { Lock } from 'bawt/utils/Lock';

const log = NewLogger('worker/LoadDBC');
const cache: Map<string, blizzardry.IWMOGroup> = new Map();
const lock: Lock = new Lock();

export class LoadWMOGroup {
  constructor(private httpService: IHttpService) {}

  public async Start(wmoPath: string): Promise<blizzardry.IWMOGroup|null> {
    await lock.lock();

    const cached = cache.get(wmoPath);
    if (cached) {
      lock.unlock();
      return cached;
    }

    log.info(`Loading WMO Group ${wmoPath}`);

    const wmoStream = await this.httpService.get(wmoPath);
    let decoded: blizzardry.IWMOGroup|null = null;
    try {
      decoded = WMOGroup.decode(wmoStream);
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
