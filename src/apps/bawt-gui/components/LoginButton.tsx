import * as React from 'react';
import styled from 'styled-components';

export interface Props {
  onClick?: () => void;
}

const Button = styled.button`
  display: block;
  padding: 0.5em 2em;
  margin-left: auto;
  margin-right: auto;
`;

export class LoginButton extends React.Component<Props, object> {
  constructor(props: Props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    if(this.props.onClick) {
      this.props.onClick();
    }
  }
  render() {
    return <Button onClick={this.onClick}>Login</Button>
  }
}
