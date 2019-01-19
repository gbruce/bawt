import Worker = require('worker-loader!./Worker');
import { IObject } from 'interface/IObject';
import { IWorkerRequest } from 'interface/IWorkerRequest';
import { pool, WorkerPool } from 'workerpool';
import { lazyInject } from 'bawt/Container';
import { IHttpService } from 'interface/IHttpService';
import { injectable } from 'inversify';

@injectable()
export class Pool {
  @lazyInject('IHttpService')
  public httpService!: IHttpService;

  private pool: WorkerPool = pool('worker.js');

  public async request(request: IWorkerRequest): Promise<any> {
    const result = await this.pool.exec('read', ['192.168.1.3', 8080, request]);
    return result;
  }
}
