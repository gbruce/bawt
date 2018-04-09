import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Container } from 'inversify';
import { InitializeCommon } from 'bawt/index';
import { WSocket } from 'bawt/net/WebSocket';
import { ISocket } from 'interface/ISocket';
import { ISession } from 'interface/ISession';
import { Root } from './components/Root';
import { IConfig } from 'interface/IConfig';
import { GlobalContainer } from 'bawt/Container';
import 'react-table/react-table.css';

const container = GlobalContainer();
container.bind<ISocket>('ISocket').to(WSocket);
InitializeCommon(container);
const config = container.get<IConfig>('IConfig');

ReactDOM.render(<Root/>, document.getElementById('root'));
