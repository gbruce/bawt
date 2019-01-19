import { M2Model } from 'bawt/assets/m2';
import { Lock } from 'bawt/utils/Lock';
import { NewLogger } from 'bawt/utils/Logger';
import { ISceneObject } from 'interface/ISceneObject';
import { IAssetProvider } from 'interface/IAssetProvider';
import { injectable, inject } from 'inversify';

const log = NewLogger('worker/LoadModel');
const cache: Map<string, M2Model> = new Map();
const lock: Lock = new Lock();

@injectable()
export class LoadModel implements IAssetProvider<ISceneObject> {
  constructor(@inject('IAssetProvider<blizzardry.IModel>') private m2Provider: IAssetProvider<blizzardry.IModel>,
              @inject('IAssetProvider<blizzardry.ISkin>') private skinProvider: IAssetProvider<blizzardry.ISkin>) {}

  public async start(m2Path: string): Promise<ISceneObject> {
    const cached = cache.get(m2Path);
    if (cached) {
      lock.unlock();
      const tmp = cached.cloneM2();
      await tmp.initialize();
      return tmp;
    }

    log.info(`Loading ${m2Path}`);

    const m2 = await this.m2Provider.start(m2Path);
    const quality = m2.viewCount - 1;
    const skinPath = m2Path.replace(/\.m2/i, `0${quality}.skin`);
    const skin = await this.skinProvider.start(skinPath);
    const model = new M2Model(m2Path, m2, skin);
    await model.initialize();

    if (model) {
      cache.set(m2Path, model);
    }

    lock.unlock();

    const cloned = model.cloneM2();
    await cloned.initialize();
    return cloned;
  }
}
