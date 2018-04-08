import * as React from "react";
import * as ReactDOM from "react-dom";
import { Container } from 'inversify';
import { InitializeCommon } from 'bawt/index';
import { WSocket } from 'bawt/net/WebSocket';
import { ISocket } from 'interface/ISocket';
import { ISession } from 'interface/ISession';
import { LoginScreen } from './components/LoginScreen';
import { IConfig } from 'interface/IConfig';
import { GlobalContainer } from 'bawt/Container';

const container = GlobalContainer();
container.bind<ISocket>('ISocket').to(WSocket);
InitializeCommon(container);
const config = container.get<IConfig>('IConfig');

ReactDOM.render(
  <LoginScreen compiler={config.AuthServer} framework="React" />,
  document.getElementById("root")
);
