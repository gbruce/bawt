import { Container } from 'inversify';
import { InitializeCommon } from 'bawt/index';
import { Socket } from 'bawt/net/Socket';
import { ISocket } from 'interface/ISocket';
import { ISession } from 'interface/ISession';
import { HttpService } from 'bawt/utils/node/HttpService';
import { IHttpService } from 'interface/IHttpService';

const container = new Container();
container.bind<ISocket>('ISocket').to(Socket);
container.bind<IHttpService>('IHttpService').to(HttpService);
InitializeCommon(container);

const session = container.get<ISession>('ISession');
session.Start();
