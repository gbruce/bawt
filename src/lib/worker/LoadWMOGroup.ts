import * as WMOGroup from 'blizzardry/lib/wmo/group';
import { IHttpService } from 'interface/IHttpService';
import { NewLogger } from 'bawt/utils/Logger';
const log = NewLogger('worker/LoadDBC');

export class LoadWMOGroup {
  constructor(private httpService: IHttpService) {}

  public async Start(wmoPath: string): Promise<blizzardry.IWMOGroup|null> {
    log.info(`Loading WMO Group ${wmoPath}`);

    const wmoStream = await this.httpService.get(wmoPath);
    let decoded: blizzardry.IWMOGroup|null = null;
    try {
      decoded = WMOGroup.decode(wmoStream);
    }
    catch (e) {
      log.error(e);
    }

    if (decoded) {
      (decoded as any).filename = wmoPath;
    }

    return decoded;
  }
}
