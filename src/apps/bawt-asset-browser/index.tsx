import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { InitializeCommon } from 'bawt/index';
import { WSocket } from 'bawt/net/WebSocket';
import { ISocket } from 'interface/ISocket';
import { Root } from './components/Root';
import { IConfig } from 'interface/IConfig';
import { GlobalContainer } from 'bawt/Container';
import { IHttpService } from 'interface/IHttpService';
import { HttpService } from 'bawt/utils/browser/HttpService';
import { Pool } from 'bawt/worker/Pool';

import 'react-table/react-table.css';

const container = GlobalContainer();
container.bind<ISocket>('ISocket').to(WSocket);
container.bind<IHttpService>('IHttpService').toConstantValue(new HttpService('127.0.0.1', 8080));
container.bind<Pool>(Pool).toSelf().inSingletonScope();
InitializeCommon(container);
const config = container.get<IConfig>('IConfig');

ReactDOM.render(<Root/>, document.getElementById('root'));
