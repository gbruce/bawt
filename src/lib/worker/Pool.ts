import { IWorkerRequest } from 'interface/IWorkerRequest';
import { lazyInject } from 'bawt/Container';
import { IHttpService } from 'interface/IHttpService';
import { injectable } from 'inversify';
import { spawn, Pool as ThreadPool, Worker } from 'threads';
import { read } from './Worker';

@injectable()
export class Pool {
  @lazyInject('IHttpService')
  public httpService!: IHttpService;

  private pool2 = ThreadPool(() => spawn(new Worker('worker.js')), 8);

  public async request(request: IWorkerRequest): Promise<any> {
    return await this.pool2.queue(async doIt => {
      const result = await read('192.168.1.24', 8080, request);
      return result;
    });
  }
}
