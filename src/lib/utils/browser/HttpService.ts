import { injectable } from 'inversify';
import { DecodeStream } from 'blizzardry/lib/restructure';
import { IHttpService } from 'interface/IHttpService';

@injectable()
export class HttpService implements IHttpService {
  private urlBase: string;
  constructor(private host: string, private port: number) {
    this.urlBase = `http://${host}:${port}/pipeline/`;
  }

  public urlFromPath(path: string): string {
    return `${this.urlBase}${encodeURI(path)}`;
  }

  public async get(path: string): Promise<DecodeStream> {
    const encodedPath = `${this.urlBase}${encodeURI(path)}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', encodedPath, true);
      xhr.onload = (ev: Event): any | null => {
        // TODO: Handle failure
        if (xhr.status >= 200 && xhr.status < 400) {
          const buffer = Buffer.from(xhr.response, 'binary');
          const decoded = new DecodeStream(buffer);
          resolve(decoded);
        }
      };
      xhr.responseType = 'arraybuffer';
      xhr.send();
    });
  }

  public async getString(path: string): Promise<string> {
    const encodedPath = `${this.urlBase}${encodeURI(path)}`;

    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', encodedPath, true);
      xhr.onload = (ev: Event): any | null => {
        // TODO: Handle failure
        if (xhr.status >= 200 && xhr.status < 400) {
          resolve(xhr.response);
        }
      };
      xhr.send();
    });
  }
}
