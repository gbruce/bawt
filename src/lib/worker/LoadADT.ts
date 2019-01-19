import ADT = require('blizzardry/lib/adt');
import { NewLogger } from 'bawt/utils/Logger';
import { Lock } from 'bawt/utils/Lock';
import { Pool } from 'bawt/worker/Pool';
import { AssetType } from 'interface/IWorkerRequest';
import { IAssetProvider } from 'interface/IAssetProvider';
import { injectable, inject } from 'inversify';

const log = NewLogger('worker/LoadDBC');
const cache: Map<string, blizzardry.IADT> = new Map();
const lock: Lock = new Lock();

@injectable()
export class LoadADT implements IAssetProvider<blizzardry.IADT> {
  constructor(@inject('Pool') private pool: Pool) {}

  public async start(adtPath: string): Promise<blizzardry.IADT> {
    await lock.lock();

    const cached = cache.get(adtPath);
    if (cached) {
      lock.unlock();
      return cached;
    }

    log.info(`Loading ${adtPath}`);

    const decoded = await this.pool.request({path: adtPath, flags: {}, type: AssetType.ADT});
    if (decoded && !cache.has(adtPath)) {
      cache.set(adtPath, decoded);
    }

    lock.unlock();

    return decoded;
  }
}
