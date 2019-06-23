import { TextureLoader as ThreeTexLoader, RepeatWrapping, Texture } from 'three';
import { NewLogger } from 'bawt/utils/Logger';
const log = NewLogger('wmo/TextureLoader');

export class TextureLoader {
  private cache = new Map<string, Texture>();
  private references = new Map();
  private pendingUnload = new Set();
  private unloaderRunning = false;
  private UNLOAD_INTERVAL = 15000;
  private loader = new ThreeTexLoader();

  public load(rawPath: string, wrapS = RepeatWrapping, wrapT = RepeatWrapping, flipY = true) {
    const path = rawPath.toUpperCase();

    // Ensure we cache based on texture settings. Some textures are reused with different settings.
    const textureKey = `${path};ws:${wrapS.toString()};wt:${wrapT.toString()};fy:${flipY}}`;

    // Prevent unintended unloading.
    if (this.pendingUnload.has(textureKey)) {
      this.pendingUnload.delete(textureKey);
    }

    // Background unloader might need to be started.
    if (!this.unloaderRunning) {
      this.unloaderRunning = true;
      this.backgroundUnload();
    }

    // Keep track of references.
    let refCount = this.references.get(textureKey) || 0;
    ++refCount;
    this.references.set(textureKey, refCount);

    const url = `http://192.168.1.24:8080/pipeline/${path}.png`;
    const encodedPath = encodeURI(url);

    log.info(`** Loading ${encodedPath}`);
    if (this.cache.has(textureKey)) {
      log.info(`CACHED - ${textureKey}`);
    }

    if (!this.cache.has(textureKey)) {
      // TODO: Promisify THREE's TextureLoader callbacks
      this.cache.set(textureKey, this.loader.load(encodedPath, (texture) => {
        texture.sourceFile = path;
        (texture as any).textureKey = textureKey;

        texture.wrapS = wrapS;
        texture.wrapT = wrapT;
        texture.flipY = flipY;

        texture.needsUpdate = true;
      }));
    }

    return this.cache.get(textureKey);
  }

  public unload(texture: Texture) {
    const textureKey = (texture as any).textureKey;

    let refCount = this.references.get(textureKey) || 1;
    --refCount;

    if (refCount === 0) {
      this.pendingUnload.add(textureKey);
    } else {
      this.references.set(textureKey, refCount);
    }
  }

  private backgroundUnload() {
    this.pendingUnload.forEach((textureKey: any, x: any, set: Set<any>) => {
      if (this.cache.has(textureKey)) {
        const texture = this.cache.get(textureKey);
        if (texture) {
          texture.dispose();
        }
      }

      this.cache.delete(textureKey);
      this.references.delete(textureKey);
      this.pendingUnload.delete(textureKey);
    });

    setTimeout(this.backgroundUnload.bind(this), this.UNLOAD_INTERVAL);
  }

}
