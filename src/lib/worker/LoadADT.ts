import ADT = require('blizzardry/lib/adt');
import { ITerrainChunk } from 'interface/Blizzardry';
import { IHttpService } from 'interface/IHttpService';
import { NewLogger } from 'bawt/utils/Logger';
const log = NewLogger('worker/LoadDBC');

export class LoadADT {
  constructor(private httpService: IHttpService) {}

  public async Start(adtPath: string, wdtFlags: any): Promise<ITerrainChunk> {
    log.info(`Loading ${adtPath}`);

    const adtStream = await this.httpService.get(adtPath);
    let decoded = null;
    try {
      decoded = ADT(wdtFlags).decode(adtStream);
    }
    catch (e) {
      log.error(e);
    }

    return decoded as ITerrainChunk;
  }
}
