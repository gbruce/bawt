import { InitializeCommon } from 'bawt/index';
import { WSocket } from 'bawt/net/WebSocket';
import { ISocket } from 'interface/ISocket';
import { IConfig } from 'interface/IConfig';
import { GlobalContainer } from 'bawt/Container';
import { IHttpService } from 'interface/IHttpService';
import { HttpService } from 'bawt/utils/browser/HttpService';
import { Pool } from 'bawt/worker/Pool';
import { VrTest } from './VrTest';

const container = GlobalContainer();
container.bind<ISocket>('ISocket').to(WSocket);
container.bind<IHttpService>('IHttpService').toConstantValue(new HttpService('192.168.1.24', 8080));
container.bind<Pool>('Pool').to(Pool).inSingletonScope();
container.bind<VrTest>('VrTest').to(VrTest).inSingletonScope();
InitializeCommon(container).then(() => {
  container.get<IConfig>('IConfig');
  container.get<VrTest>('VrTest');
});

