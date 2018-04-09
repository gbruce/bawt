import * as React from 'react';
import { LoginScreen } from './LoginScreen';
import { RealmView } from './RealmView';
import { Realm } from 'bawt/auth/packets/server/RealmList';
import { ThemeProvider } from 'styled-components';

const theme = {
  main: 'mediumseagreen',
};

interface IState {
  loggedIn: boolean;
}

export class Root extends React.Component<{}, IState> {

  constructor(props: {}) {
    super(props);
    this.state = { loggedIn: false};
    this.onLoggedIn = this.onLoggedIn.bind(this);
  }

  private onLoggedIn() {
    this.setState({ loggedIn: true });
  }

  public render() {
    if (this.state.loggedIn) {
      return <ThemeProvider theme={theme}><RealmView/></ThemeProvider>
    }
    else {
      return <ThemeProvider theme={theme}><LoginScreen onLoggedIn={this.onLoggedIn}/></ThemeProvider>;
    }
  }
}
