import * as Entities from 'blizzardry/lib/dbc/entities';
import { IHttpService } from 'interface/IHttpService';
import { DBC } from 'bawt/assets/dbc';
import { NewLogger } from 'bawt/utils/Logger';
const log = NewLogger('worker/LoadDBC');

export class LoadDBC {
  private path: string | null = null;

  constructor(private httpService: IHttpService) {}

  public async Start(dbcPath: string) {
    const dbcStream = await this.httpService.get(dbcPath);
    const components = dbcPath.split(/[\\.]+/);
    const dbcType = Entities[components[1]];

    if (!dbcType) {
      throw new Error(`Could not find entity for ${components[1]}`);
    }

    let dbc = null;
    try {
      dbc = dbcType.dbc.decode(dbcStream) as any;
    }
    catch (e) {
      throw new Error(`Could not decode ${dbcPath}`);
    }

    const dbcReturn = new DBC(dbc, dbcType);

    return dbcReturn;
  }
}
