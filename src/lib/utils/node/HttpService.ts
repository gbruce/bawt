import { injectable } from 'inversify';
import { DecodeStream } from 'blizzardry/lib/restructure';
import * as request from 'request-promise';
import { IHttpService } from 'interface/IHttpService';

@injectable()
export class HttpService implements IHttpService {
  public async get(path: string): Promise<DecodeStream> {
    const encodedPath = `http://localhost:8080/pipeline/${encodeURI(path)}`;
    const raw: string = await request.get({
      url: encodedPath,
      encoding: 'binary',
    });

    const buffer = Buffer.from(raw, 'binary');
    return new DecodeStream(buffer);
  }

  public async getString(path: string): Promise<string> {
    const encodedPath = `http://localhost:8080/pipeline/${encodeURI(path)}`;
    const raw: string = await request.get({
      url: encodedPath,
    });
    return raw;
  }
}
