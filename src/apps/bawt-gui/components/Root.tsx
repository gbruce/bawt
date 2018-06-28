import * as React from 'react';
import { LoginView } from './LoginView';
import { RealmView } from './RealmView';
import { CharacterView } from './CharacterView';
import { GameView } from './GameView';
import { IRealm } from 'interface/IRealm';
import { ICharacter } from 'interface/ICharacter';
import { } from 'material-ui';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import blue from 'material-ui/colors/blue';

const theme = createMuiTheme({
  palette: {
    primary: blue,
  },
});

interface IState {
  appState: AppState;
  loggedIn: boolean;
  realm: IRealm|null;
  character: ICharacter|null;
}

enum AppState {
  InputtingCredentials,
  SelectingRealm,
  SelectingCharacter,
  Playing,
}

export class Root extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);
    this.state = { loggedIn: false, realm: null, character: null, appState: AppState.InputtingCredentials };
    this.onLoggedIn = this.onLoggedIn.bind(this);
    this.onRealmSelected = this.onRealmSelected.bind(this);
    this.onCharacterSelected = this.onCharacterSelected.bind(this);
  }

  private onLoggedIn() {
    this.setState({ appState: AppState.SelectingRealm });
  }

  private onRealmSelected(realm: IRealm) {
    this.setState({ realm, appState: AppState.SelectingCharacter });
  }

  private onCharacterSelected(character: ICharacter) {
    this.setState({ character, appState: AppState.Playing});
  }

  private renderCharacterView() {
    if (this.state.realm) {
      return (<CharacterView realm={this.state.realm} onSelected={this.onCharacterSelected}/>);
    }

    return (null);
  }

  private renderGameView() {
    if (this.state.character) {
      return (<GameView/>);
    }

    return (null);
  }

  public render() {
    switch (this.state.appState) {
      case AppState.InputtingCredentials:
        return <MuiThemeProvider theme={theme}>
                <LoginView onLoggedIn={this.onLoggedIn}/>
                </MuiThemeProvider>;
      case AppState.SelectingRealm:
        return  <MuiThemeProvider theme={theme}>
                  <RealmView onSelected={this.onRealmSelected}/>
                </MuiThemeProvider>;
      case AppState.SelectingCharacter:
        return  <MuiThemeProvider theme={theme}>
                  {this.renderCharacterView()}
                </MuiThemeProvider>;
      case AppState.Playing:
        return  <MuiThemeProvider theme={theme}>
                  {this.renderGameView()}
                </MuiThemeProvider>;
    }
  }
}
