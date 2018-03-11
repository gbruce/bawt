import { Container } from 'inversify';
import { InitializeCommon } from './index';
import { Socket } from './lib/net/Socket';
import { ISocket } from './interface/ISocket';
import { ISession } from './interface/ISession';

const container = new Container();
container.bind<ISocket>('ISocket').to(Socket);
InitializeCommon(container);

async function test() {
  const session = container.get<ISession>('ISession');
  await session.Start();
  await session.Stop();
}

test();
