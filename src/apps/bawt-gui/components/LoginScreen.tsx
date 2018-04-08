import * as React from 'react';
import { inject } from 'inversify';
import styled, { ThemeProvider } from 'styled-components';
import { LoginButton } from './LoginButton';
import { Input } from './Input';
import { IConfig } from 'interface/IConfig';
import { lazyInject } from 'bawt/Container';
import { Credentials } from 'bawt/utils/Credentials';
import AuthHandler from 'bawt/auth/AuthHandler';

const theme = {
  main: 'mediumseagreen',
};

const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: ${(props) => props.theme.main};
`;

const Server = styled.text`
  display: block;
  text-align: center;
  color: ${(props) => props.theme.main};
`;

const Wrapper = styled.section`
  padding: 4em;
  background: black;
`;

export class LoginScreen extends React.Component<{}, object> {
  @lazyInject('IConfig')
  public config!: IConfig;
  private credentials: Credentials = new Credentials();

  @lazyInject(AuthHandler)
  private auth!: AuthHandler;

  constructor(props: {}) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onAccountChanged = this.onAccountChanged.bind(this);
    this.onPasswordChanged = this.onPasswordChanged.bind(this);
  }

  private onAccountChanged(account: string) {
    this.credentials.Account = account;
  }

  private onPasswordChanged(password: string) {
    this.credentials.Password = password;
  }

  private async onClick() {
    await this.auth.connect(this.config.AuthServer, this.config.Port, this.credentials);
  }

  public render() {
    return <ThemeProvider theme={theme}>
      <Wrapper>
        <Title>World of Warcraft</Title>
        <Server>{this.config.AuthServer}</Server>
        <Input label='Account Name' color='yellow' type='text' defaultValue={this.credentials.Account}
          onValueChanged={this.onAccountChanged}/>
        <Input label='Password' color='yellow' type='password' defaultValue={this.credentials.Password}
          onValueChanged={this.onPasswordChanged}/>
        <LoginButton onClick={this.onClick}/>
      </Wrapper>
      </ThemeProvider>;
  }
}
