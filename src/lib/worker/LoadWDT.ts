import * as WDT from 'blizzardry/lib/wdt';
import { NewLogger } from 'bawt/utils/Logger';
import { injectable, inject } from 'inversify';
import { IAssetProvider } from 'interface/IAssetProvider';
import { Pool } from './Pool';
import { Lock } from 'bawt/utils/Lock';
import { AssetType } from 'interface/IWorkerRequest';

const log = NewLogger('worker/LoadWDT');
const cache: Map<string, WDT.IWDT> = new Map();
const lock: Lock = new Lock();

@injectable()
export class LoadWDT implements IAssetProvider<WDT.IWDT> {
  constructor(@inject('Pool') private pool: Pool) {}

  public async start(wdtPath: string): Promise<WDT.IWDT> {
    await lock.lock();

    const cached = cache.get(wdtPath);
    if (cached) {
      lock.unlock();
      return cached;
    }

    log.info(`Loading ${wdtPath}`);

    const decoded = await this.pool.request({path: wdtPath, flags: {}, type: AssetType.WDT});
    if (decoded && !cache.has(wdtPath)) {
      cache.set(wdtPath, decoded);
    }

    lock.unlock();

    return decoded;
  }
}
