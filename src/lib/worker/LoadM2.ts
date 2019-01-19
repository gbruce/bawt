import { Lock } from 'bawt/utils/Lock';
import { NewLogger } from 'bawt/utils/Logger';
import { IAssetProvider } from 'interface/IAssetProvider';
import { injectable, inject } from 'inversify';
import { Pool } from 'bawt/worker/Pool';
import { AssetType } from 'interface/IWorkerRequest';

const log = NewLogger('worker/LoadM2');
const cache: Map<string, any> = new Map();
const lock: Lock = new Lock();

@injectable()
export class LoadM2 implements IAssetProvider<blizzardry.IModel>  {
  constructor(@inject('Pool') private pool: Pool) {}

  public async start(m2Path: string): Promise<blizzardry.IModel> {
    await lock.lock();

    const cached = cache.get(m2Path);
    if (cached) {
      lock.unlock();
      return cached;
    }

    log.info(`Loading ${m2Path}`);
    const m2 = await this.pool.request({path: m2Path, flags: {}, type: AssetType.M2});
    if (m2) {
      cache.set(m2Path, m2);
    }

    lock.unlock();

    return m2;
  }
}
