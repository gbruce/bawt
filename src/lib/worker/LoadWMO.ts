import * as WMO from 'blizzardry/lib/wmo';
import { IHttpService } from 'interface/IHttpService';
import { NewLogger } from 'bawt/utils/Logger';
import { Lock } from 'bawt/utils/Lock';
import { Pool } from 'bawt/worker/Pool';
import { AssetType } from 'interface/IWorkerRequest';
import { IAssetProvider } from 'interface/IAssetProvider';
import { inject, injectable } from 'inversify';

const log = NewLogger('worker/LoadWMO');

const cache: Map<string, blizzardry.IWMO> = new Map();
const lock: Lock = new Lock();

@injectable()
export class LoadWMO implements IAssetProvider<blizzardry.IWMO>  {
  constructor(@inject('Pool') private pool: Pool) {}

  public async start(wmoPath: string): Promise<blizzardry.IWMO> {
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
