import { Container } from 'inversify';
import { InitializeCommon } from 'bawt/index';
import { Socket } from 'bawt/net/Socket';
import { ISocket } from 'interface/ISocket';
import { ISession } from 'interface/ISession';

const container = new Container();
container.bind<ISocket>('ISocket').to(Socket);
InitializeCommon(container);

const session = container.get<ISession>('ISession');
session.Start();
