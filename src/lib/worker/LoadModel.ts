import { M2Model } from 'bawt/assets/m2';
import { Lock } from 'bawt/utils/Lock';
import { NewLogger } from 'bawt/utils/Logger';
import { LoadM2 } from 'bawt/worker/LoadM2';
import { LoadSkin } from 'bawt/worker/LoadSkin';
import { IHttpService } from 'interface/IHttpService';

const log = NewLogger('worker/LoadModel');
const cache: Map<string, M2Model> = new Map();
const lock: Lock = new Lock();

export class LoadModel {
  constructor(private httpService: IHttpService) {}

  public async Start(m2Path: string) {
    const cached = cache.get(m2Path);
    if (cached) {
      lock.unlock();
      return cached.cloneM2();
    }

    log.info(`Loading ${m2Path}`);

    const m2Loader = new LoadM2(this.httpService);
    const skinLoader = new LoadSkin(this.httpService);
    const m2 = await m2Loader.Start(m2Path);
    const quality = m2.viewCount - 1;
    const skinPath = m2Path.replace(/\.m2/i, `0${quality}.skin`);
    const skin = await skinLoader.Start(skinPath);
    const model = new M2Model(m2Path, m2, skin);

    if (model) {
      cache.set(m2Path, model);
    }

    lock.unlock();

    return model.cloneM2();
  }
}
