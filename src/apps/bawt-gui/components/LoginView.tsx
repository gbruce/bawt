import * as React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import { lazyInject } from 'bawt/Container';
import { IConfig } from 'interface/IConfig';
import { Credentials } from 'bawt/utils/Credentials';
import AuthHandler from 'bawt/auth/AuthHandler';

export interface Props {
  onLoggedIn?: () => void;
}

export class LoginView extends React.Component<Props, {}> {
  @lazyInject('IConfig')
  public config!: IConfig;
  private credentials: Credentials = new Credentials();

  @lazyInject(AuthHandler)
  private auth!: AuthHandler;

  constructor(props: Props) {
    super(props);
    this.onLogin = this.onLogin.bind(this);
    this.onAccountChanged = this.onAccountChanged.bind(this);
    this.onPasswordChanged = this.onPasswordChanged.bind(this);
    this.onKeypress = this.onKeypress.bind(this);
  }

  private onAccountChanged(event: object, account: string) {
    this.credentials.Account = account;
  }

  private onPasswordChanged(event: object, password: string) {
    this.credentials.Password = password;
  }

  private onKeypress(event: any) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onLogin();
    }
  }

  private async onLogin() {
    await this.auth.connect(this.config.AuthServer, this.config.Port, this.credentials);
    if (this.props.onLoggedIn) {
      this.props.onLoggedIn();
    }
  }

  render() {
    const actions = [
      <FlatButton
        label="Login"
        primary={true}
        onClick={this.onLogin}
      />,
    ];

    return(
      <Dialog
        title="World of Warcraft"
        titleStyle={{textAlign: "center"}}
        actions={actions}
        modal={true}
        open={true}
        contentStyle={{ width: '400px'}}
        bodyStyle={{minHeight: '200px'}}
      >
        <TextField
          floatingLabelFixed={true}
          floatingLabelText="Account Name"
          type="text"
          onChange={this.onAccountChanged}
        /><br></br>
        <TextField
          floatingLabelFixed={true}
          floatingLabelText="Account Password"
          type="password"
          onChange={this.onPasswordChanged}
          onKeyPress={this.onKeypress}
        />
      </Dialog>
    )
  }
}
