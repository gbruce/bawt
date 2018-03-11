import { Container } from 'inversify';
import { InitializeCommon } from '../index';
import { Socket } from '../lib/net/Socket';
import { ISocket } from '../interface/ISocket';
import { ISession } from '../interface/ISession';
import 'mocha';

it('test connect to lights hope server', async function() {
  this.timeout(10000);

  const container = new Container();
  container.bind<ISocket>('ISocket').to(Socket);
  await InitializeCommon(container);

  const session = container.get<ISession>('ISession');
  await session.Start();
  await session.Stop();
});
