
import * as M2 from 'blizzardry/lib/m2';
import * as Skin from 'blizzardry/lib/m2/skin';
import { IHttpService } from 'interface/IHttpService';
import { NewLogger } from 'bawt/utils/Logger';
import { Lock } from 'bawt/utils/Lock';
const log = NewLogger('worker/LoadM2');

const cache: Map<string, any> = new Map();
const lock: Lock = new Lock();

export class LoadM2 {
  private path: string | null = null;

  constructor(private httpService: IHttpService) {}

  public async Start(m2Path: string) {
    await lock.lock();

    const cached = cache.get(m2Path);
    if (cached) {
      lock.unlock();
      return cached;
    }

    log.info(`Loading ${m2Path}`);
    const m2Stream = await this.httpService.get(m2Path);
    const m2 = M2.decode(m2Stream);

    // TODO: Allow configuring quality
    const quality = m2.viewCount - 1;
    const skinPath = m2Path.replace(/\.m2/i, `0${quality}.skin`);
    const skinStream = await this.httpService.get(skinPath);
    const skin = Skin.decode(skinStream);

    if (m2 && skin && !cache.has(m2Path)) {
      cache.set(m2Path, {m2, skin, filename: m2Path});
    }

    lock.unlock();

    return {m2, skin, filename: m2Path};
  }
}
