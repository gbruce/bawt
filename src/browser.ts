import { Container } from 'inversify';
import { InitializeCommon } from './index';
import { WSocket } from './lib/net/WebSocket';
import { ISocket } from './interface/ISocket';

const container = new Container();
container.bind<ISocket>('ISocket').to(WSocket);
InitializeCommon(container);
