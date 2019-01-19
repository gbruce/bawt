import * as WMO from 'blizzardry/lib/wmo';
import { IHttpService } from 'interface/IHttpService';
import { NewLogger } from 'bawt/utils/Logger';
import { Lock } from 'bawt/utils/Lock';
import { Pool } from 'bawt/worker/Pool';
import { lazyInject } from 'bawt/Container';
import { AssetType } from 'interface/IWorkerRequest';

const log = NewLogger('worker/LoadDBC');

const cache: Map<string, blizzardry.IWMO> = new Map();
const lock: Lock = new Lock();

export class LoadWMO {
  constructor(private httpService: IHttpService) {}

  @lazyInject(Pool)
  public pool!: Pool;

  public async Start(wmoPath: string): Promise<blizzardry.IWMO|null> {
    await lock.lock();

    const cached = cache.get(wmoPath);
    if (cached) {
      lock.unlock();
      return cached;
    }

    log.info(`Loading ${wmoPath}`);

    const decoded = await this.pool.request({path: wmoPath, type: AssetType.WMO});
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
