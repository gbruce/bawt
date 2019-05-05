import * as WMOGroup from 'blizzardry/lib/wmo/group';
import { NewLogger } from 'bawt/utils/Logger';
import { Lock } from 'bawt/utils/Lock';
import { AssetType } from 'interface/IWorkerRequest';
import { Pool } from 'bawt/worker/Pool';
import { IAssetProvider } from 'interface/IAssetProvider';
import { inject, injectable } from 'inversify';

const log = NewLogger('worker/LoadDBC');
const cache: Map<string, blizzardry.IWMOGroup> = new Map();
const lock: Lock = new Lock();

@injectable()
export class LoadWMOGroup implements IAssetProvider<blizzardry.IWMOGroup> {
  constructor(@inject('Pool') private pool: Pool) {}

  public async start(wmoPath: string): Promise<blizzardry.IWMOGroup> {
    await lock.lock();

    const cached = cache.get(wmoPath);
    if (cached) {
      lock.unlock();
      return cached;
    }

    log.info(`Loading WMO Group ${wmoPath}`);

    const decoded = await this.pool.request({path: wmoPath, type: AssetType.WMOGroup});
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
