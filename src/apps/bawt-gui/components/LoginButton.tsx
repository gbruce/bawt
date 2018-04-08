import * as React from 'react';
import styled from 'styled-components';

export interface IProps {
  onClick?: () => void;
}

const Button = styled.button`
  display: block;
  padding: 0.5em 2em;
  margin-left: auto;
  margin-right: auto;
`;

export class LoginButton extends React.Component<IProps, object> {
  constructor(props: IProps) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  private onClick() {
    if (this.props.onClick) {
      this.props.onClick();
    }
  }

  public render() {
    return <Button onClick={this.onClick}>Login</Button>;
  }
}
