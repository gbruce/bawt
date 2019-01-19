import * as React from 'react';
import Dialog from 'material-ui/Dialog';
import { DialogTitle, DialogContent, DialogActions, DialogContentText } from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import { lazyInject } from 'bawt/Container';
import { IConfig } from 'interface/IConfig';
import { Credentials } from 'bawt/utils/Credentials';
import AuthHandler from 'bawt/auth/AuthHandler';
import { ChangeEvent } from 'react';

export interface IProps {
  onLoggedIn?: () => void;
}

export class LoginView extends React.Component<IProps, {}> {
  @lazyInject('IConfig')
  public config!: IConfig;
  private credentials: Credentials = new Credentials();

  @lazyInject(AuthHandler)
  private auth!: AuthHandler;

  constructor(props: IProps) {
    super(props);
    this.onLogin = this.onLogin.bind(this);
    this.onAccountChanged = this.onAccountChanged.bind(this);
    this.onPasswordChanged = this.onPasswordChanged.bind(this);
    this.onKeypress = this.onKeypress.bind(this);
  }

  private onAccountChanged(event: ChangeEvent<HTMLInputElement>) {
    this.credentials.Account = event.target.value;
  }

  private onPasswordChanged(event: ChangeEvent<HTMLInputElement>) {
    this.credentials.Password = event.target.value;
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

  public render() {
    return(
      <Dialog
        open={true}
        style={{minHeight: '200px'}}
      >
        <DialogTitle style={{textAlign: 'center'}}>
          {'World of Warcraft'}
        </DialogTitle>
        <DialogContent style={{ width: '400px', textAlign: 'center'}}>
          <div style={{ margin: '34px'}}>
          <DialogContentText>Account Name</DialogContentText>
          <TextField
            type='text'
            onChange={this.onAccountChanged}
          />
          </div>
          <DialogContentText>Account Password</DialogContentText>
          <TextField
            type='password'
            onChange={this.onPasswordChanged}
            onKeyPress={this.onKeypress}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.onLogin} color='primary'>
            Login
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
