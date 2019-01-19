import * as WDT from 'blizzardry/lib/wdt';
import { IHttpService } from 'interface/IHttpService';
import { NewLogger } from 'bawt/utils/Logger';
const log = NewLogger('worker/LoadDBC');

export class LoadWDT {
  constructor(private httpService: IHttpService) {}

  public async Start(wdtPath: string): Promise<WDT.IWDT> {
    log.info(`Loading ${wdtPath}`);

    const wdtStream = await this.httpService.get(wdtPath);
    let decoded = null;
    try {
      decoded = WDT.decode(wdtStream);
    }
    catch (e) {
      log.error(e);
    }

    return decoded;
  }
}
