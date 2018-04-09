import * as React from 'react';
import styled from 'styled-components';
import { lazyInject } from 'bawt/Container';
import AuthHandler from 'bawt/auth/AuthHandler';
import { IRealm } from 'interface/IRealm';
import ReactTable, { Column } from 'react-table';

type State = {
  realms: IRealm [];
  selected: IRealm|null;
};

const Wrapper = styled.div`
  padding: 4em;
  background: white;
`;
const Title = styled.h3`
  text-align: center;
`;

const CountCell = styled.div`
  text-align: center;
`;

export class RealmView extends React.Component<{}, State> {
  @lazyInject(AuthHandler)
  private auth!: AuthHandler;

  constructor(props: {}) {
    super(props);
    this.state = {
      realms: [],
      selected: null,
    };

    this.onClicked = this.onClicked.bind(this);
  }

  public async componentDidMount() {
    this.auth.GetRealms().then((realms) => {
      this.setState({ realms: realms });
    });
  }

  private onClicked(selected: IRealm) {
    this.setState({
      selected: selected,
    })
  }

  public render() {
    const columns: Column[] = [
    {
      accessor: 'Name',
      width: 260,
      Header: (props: any, column: any) => (
        <div style={{ textAlign: 'left' }}>Realm Name</div>
      )
    },
    {
      id: 'Type',
      Header: (props: any, column: any) => (
        <div style={{ textAlign: 'left' }}>Type</div>
      ),
      accessor: (props: IRealm) => {
        if(props.Type === 1) {
          return '(PVP)';
        }
        
        return 'Normal';
      },
      width: 70,
      Cell: (props: any, column: any) => (
        <div
          style={{
            textAlign: 'center',
            color: `${props.original.Type === 1 ? 'red' : 'black'}`
          }}
        >{props.value}
        </div>
      )
    },
    {
      id: 'CharacterCount',
      Header: <div style={{ textAlign: 'left' }}>Characters</div>,
      accessor: (props: IRealm) => {
        if (props.CharacterCount > 0) {
          return `(${props.CharacterCount})`;
        }

        return '';
      },
      width: 90,
      Cell: row => (
        <CountCell>{row.value}</CountCell>
      )
    },
    {
      id: 'Population',
      Header: <div style={{ textAlign: 'left' }}>Population</div>,
      accessor: (props: IRealm) => {
        if(props.Population > 1.97) {
          return 'High';
        }

        if(props.Population > 1.80) {
          return 'Medium';
        }

        return 'Low';
      },
      width: 100,
      Cell: (props: any, column: any) => (
        <div
          style={{
            textAlign: 'center',
            color: `${props.original.Population > 1.97 ? 'red' : (props.original.Population < 1.80 ? 'green' : 'black')}`
          }}
        >{props.value}
        </div>
      )
    }];

    return(
      <Wrapper>
        <Title>Realm Selection</Title>
        <ReactTable
          pageSize={10}
          data={this.state.realms}
          columns={columns}
          showPagination={false}
          className="-highlight"
          style={{
            height: '400px',
            width: '520px',
            margin: 'auto',
          }}
          getTrProps={(state: any, rowInfo: any, column: any, instance: any) => {
            return {
              onClick: (e: any, handleOriginal: any) => {
                this.onClicked(rowInfo.original);
              },
              style: {
                background: (this.state.selected && rowInfo && this.state.selected === rowInfo.original) ? 'SkyBlue' : 'none',
              },
            }
          }}
          getTdProps={(state: any, rowInfo: any, column: any, instance: any) => {
            return {
              style: {
                fontWeight: (this.state.selected && rowInfo && this.state.selected === rowInfo.original) ? 'bold' : 'normal',
              },
            }
          }}
        />
      </Wrapper>
    );
  }
}
