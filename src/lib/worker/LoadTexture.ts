
import { Texture, TextureLoader, RepeatWrapping } from 'three';
import { IHttpService } from 'interface/IHttpService';
import { NewLogger } from 'bawt/utils/Logger';
const log = NewLogger('worker/LoadDBC');

export class LoadTexture {
  constructor(private httpService: IHttpService) {}

  public async Start(rawPath: string, wrapS = RepeatWrapping, wrapT = RepeatWrapping, flipY = true) {
    log.info(`Loading ${rawPath}`);

    // Ensure we cache based on texture settings. Some textures are reused with different settings.
    const textureKey = `${rawPath};ws:${wrapS.toString()};wt:${wrapT.toString()};fy:${flipY}}`;

    return new Promise<Texture>((resolve) => {
      const loader = new TextureLoader();
      loader.load(rawPath, (texture: Texture) => {
        texture.sourceFile = rawPath;
        // texture.textureKey = textureKey;

        texture.wrapS = wrapS;
        texture.wrapT = wrapT;
        texture.flipY = flipY;

        texture.needsUpdate = true;
        resolve(texture);
      });
    });
  }
}
