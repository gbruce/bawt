import * as Entities from 'blizzardry/lib/dbc/entities';
import { IHttpService } from 'interface/IHttpService';
import { DBC } from 'bawt/assets/dbc';

export class LoadDBC {
  private path: string | null = null;

  constructor(private httpService: IHttpService) {}

  public async Start(dbcPath: string) {
    const dbcStream = await this.httpService.get(dbcPath);
    const components = dbcPath.split(/[\\.]+/);
    const dbcType = Entities[components[1]];

    if (!dbcType) {
      return null;
    }

    const dbc = dbcType.dbc.decode(dbcStream) as any;
    const dbcReturn = new DBC(dbc, dbcType);

    return dbcReturn;
  }
}
