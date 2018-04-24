import * as React from 'react';
import { LoginView } from './LoginView';
import { RealmView } from './RealmView';
import { CharacterView } from './CharacterView';
import { GameView } from './GameView';
import { IRealm } from 'interface/IRealm';
import { ThemeProvider } from 'styled-components';
import { ICharacter } from 'interface/ICharacter';
import { } from 'material-ui';
import { MuiThemeProvider } from 'material-ui/styles';

const theme = {
  main: 'mediumseagreen',
};

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
  Playing
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

  private onRealmSelected (realm: IRealm) {
    this.setState({ realm: realm, appState: AppState.SelectingCharacter });
  }

  private onCharacterSelected (character: ICharacter) {
    this.setState({ character: character, appState: AppState.Playing});
  }

  private renderCharacterView() {
    if (this.state.realm) {
      return (<CharacterView realm={this.state.realm} onSelected={this.onCharacterSelected}/>);
    }
    
    return (null);
  }

  private renderGameView() {
    if (this.state.character) {
      return (<GameView character={this.state.character}/>);
    }

    return (null);
  }

  public render() {
    switch(this.state.appState) {
      case AppState.InputtingCredentials:
        return  <ThemeProvider theme={theme}>
                  <MuiThemeProvider>
                    <div>
                      <LoginView onLoggedIn={this.onLoggedIn}/>
                    </div>
                  </MuiThemeProvider>
                </ThemeProvider>;
      case AppState.SelectingRealm:
        return  <ThemeProvider theme={theme}>
                  <MuiThemeProvider>
                    <RealmView onSelected={this.onRealmSelected}/>
                  </MuiThemeProvider>
                </ThemeProvider>;
      case AppState.SelectingCharacter:
        return  <ThemeProvider theme={theme}>
                  <MuiThemeProvider>
                    {this.renderCharacterView()}
                  </MuiThemeProvider>
                </ThemeProvider>;
      case AppState.Playing:
        return  <ThemeProvider theme={theme}>
                  {this.renderGameView()}
                </ThemeProvider>;
    }
  }
}
