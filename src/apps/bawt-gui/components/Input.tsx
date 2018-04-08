import * as React from 'react';
import styled from 'styled-components';

export interface InputProps {
  label: string;
  color: string;
  type: string;
  defaultValue: string;
  onValueChanged?: (nextValue: string) => void;
}

interface InputState {
  value: string;
}

const DivElement = styled.div`
  display: block;
  padding: 0.5em 2em;
  margin-left: auto;
  margin-right: auto;
  color: white;
`;

const TextElement = styled.text`
  display: block;
  padding: 0.5em 2em;
  margin-left: auto;
  margin-right: auto;
  color: ${(props) => props.theme.main};
  text-align: center;
`;

const InputElement = styled.input`
  display: block;
  padding: 0.5em 2em;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
`;

export class Input extends React.Component<InputProps, InputState> {
  constructor(props: InputProps) {
    super(props);
    this.state = { value: props.defaultValue};

    this.handleChange = this.handleChange.bind(this);
  }

  public componentDidUpdate(prevProps: InputProps, prevState: InputState) {
    if (this.props.onValueChanged) {
      this.props.onValueChanged(this.state.value);
    }
  }

  private handleChange(event: any) {
    this.setState({value: event.target.value});
  }

  public render() {
    return<DivElement>
      <TextElement>{this.props.label}</TextElement>
      <InputElement value={this.state.value} type={this.props.type} onChange={this.handleChange}/>
     </DivElement>;
  }
}
