import { Lock } from 'bawt/utils/Lock';
import { NewLogger } from 'bawt/utils/Logger';
import * as Skin from 'blizzardry/lib/m2/skin';
import { IHttpService } from 'interface/IHttpService';

const log = NewLogger('worker/LoadSkin');
const cache: Map<string, any> = new Map();
const lock: Lock = new Lock();

export class LoadSkin {
  constructor(private httpService: IHttpService) {}

  public async Start(skinPath: string) {
    await lock.lock();

    const cached = cache.get(skinPath);
    if (cached) {
      lock.unlock();
      return cached;
    }

    log.info(`Loading ${skinPath}`);
    const skinStream = await this.httpService.get(skinPath);
    const skin = Skin.decode(skinStream);

    if (skin && !cache.has(skinPath)) {
      cache.set(skinPath, skin);
    }

    lock.unlock();

    return skin;
  }
}
