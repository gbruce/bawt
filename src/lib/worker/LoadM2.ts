
import * as M2 from 'blizzardry/lib/m2';
import * as Skin from 'blizzardry/lib/m2/skin';
import { IHttpService } from 'interface/IHttpService';

export class LoadM2 {
  private path: string | null = null;

  constructor(private httpService: IHttpService) {}

  public async Start(m2Path: string) {
    const m2Stream = await this.httpService.get(m2Path);
    const m2 = M2.decode(m2Stream);

    // TODO: Allow configuring quality
    const quality = m2.viewCount - 1;
    const skinPath = m2Path.replace(/\.m2/i, `0${quality}.skin`);
    const skinStream = await this.httpService.get(skinPath);
    const skin = Skin.decode(skinStream);
    return {m2, skin};
  }
}
