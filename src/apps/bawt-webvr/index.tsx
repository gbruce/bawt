import { InitializeCommon } from 'bawt/index';
import { WSocket } from 'bawt/net/WebSocket';
import { ISocket } from 'interface/ISocket';
import { IConfig } from 'interface/IConfig';
import { GlobalContainer } from 'bawt/Container';
import { IHttpService } from 'interface/IHttpService';
import { HttpService } from 'bawt/utils/browser/HttpService';
import { VrTest } from './VrTest';

const container = GlobalContainer();
container.bind<ISocket>('ISocket').to(WSocket);
container.bind<IHttpService>('IHttpService').toConstantValue(new HttpService('192.168.1.3', 8080));
InitializeCommon(container);
const config = container.get<IConfig>('IConfig');
const vrTest = new VrTest();
