import { Container } from 'inversify';
import { InitializeCommon } from './index';
import { Socket } from './lib/net/Socket';
import { ISocket } from './interface/ISocket';

const container = new Container();
container.bind<ISocket>('ISocket').to(Socket);
InitializeCommon(container);
