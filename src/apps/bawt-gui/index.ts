import { Container } from 'inversify';
import { InitializeCommon } from 'bawt/index';
import { WSocket } from 'bawt/net/WebSocket';
import { ISocket } from 'interface/ISocket';
import { ISession } from 'interface/ISession';
import { GlobalContainer } from 'bawt/Container';

const container =  GlobalContainer();
container.bind<ISocket>('ISocket').to(WSocket);
InitializeCommon(container);

const session = container.get<ISession>('ISession');
session.Start();
