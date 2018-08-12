import * as WMO from 'blizzardry/lib/wmo';
import { IHttpService } from 'interface/IHttpService';
import { NewLogger } from 'bawt/utils/Logger';
const log = NewLogger('worker/LoadDBC');

export class LoadWMO {
  constructor(private httpService: IHttpService) {}

  public async Start(wmoPath: string): Promise<any> {
    log.info(`Loading ${wmoPath}`);

    const wmoStream = await this.httpService.get(wmoPath);
    let decoded = null;
    try {
      decoded = WMO.decode(wmoStream);
    }
    catch (e) {
      log.error(e);
    }

    return decoded;
  }
}
