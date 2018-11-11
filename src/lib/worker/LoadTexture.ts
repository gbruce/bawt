
import { Texture, TextureLoader, RepeatWrapping } from 'three';
import { IHttpService } from 'interface/IHttpService';
import { NewLogger } from 'bawt/utils/Logger';
import { Lock } from 'bawt/utils/Lock';
const log = NewLogger('worker/LoadDBC');

const cache: Map<string, Texture> = new Map();
const lock: Lock = new Lock();

export class LoadTexture {
  constructor(private httpService: IHttpService) {}

  public async Start(rawPath: string, wrapS = RepeatWrapping, wrapT = RepeatWrapping, flipY = true) {
    const path = `${rawPath.toUpperCase()}.png`;

    // Ensure we cache based on texture settings. Some textures are reused with different settings.
    const textureKey = `${path};ws:${wrapS.toString()};wt:${wrapT.toString()};fy:${flipY}}`;

    await lock.lock();

    const cached = cache.get(path);
    if (cached) {
      lock.unlock();
      return cached;
    }

    const url = this.httpService.urlFromPath(path);

    log.info(`Loading ${url}`);

    return new Promise<Texture>((resolve) => {
      const loader = new TextureLoader();
      loader.load(url, (texture: Texture) => {
        texture.sourceFile = path;
        // texture.textureKey = textureKey;

        texture.wrapS = wrapS;
        texture.wrapT = wrapT;
        texture.flipY = flipY;

        texture.needsUpdate = true;
        
        if (!cache.has(path)) {
          cache.set(path, texture);
        }
        lock.unlock();

        resolve(texture);
      },
      () => {},
      (error) => {
        lock.unlock();
      });
    });
  }
}
