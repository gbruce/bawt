import { Lock } from 'bawt/utils/Lock';
import { NewLogger } from 'bawt/utils/Logger';
import { IHttpService } from 'interface/IHttpService';
import { IAssetProvider } from 'interface/IAssetProvider';
import { inject, injectable } from 'inversify';
import { Pool } from 'bawt/worker/Pool';
import { AssetType } from 'interface/IWorkerRequest';

const log = NewLogger('worker/LoadSkin');
const cache: Map<string, any> = new Map();
const lock: Lock = new Lock();

@injectable()
export class LoadSkin implements IAssetProvider<blizzardry.ISkin> {
  constructor(@inject('IHttpService') private httpService: IHttpService,
              @inject('Pool') private pool: Pool) {}

  public async start(skinPath: string): Promise<blizzardry.ISkin>  {
    await lock.lock();

    const cached = cache.get(skinPath);
    if (cached) {
      lock.unlock();
      return cached;
    }

    log.info(`Loading ${skinPath}`);
    const skin = await this.pool.request({path: skinPath, flags: {}, type: AssetType.Skin});
    if (skin && !cache.has(skinPath)) {
      cache.set(skinPath, skin);
    }

    lock.unlock();

    return skin;
  }
}
