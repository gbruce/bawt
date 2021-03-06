import * as React from 'react';
import { lazyInject } from 'bawt/Container';
import AuthHandler from 'bawt/auth/AuthHandler';
import { IRealm } from 'interface/IRealm';
import { Names } from 'bawt/utils/Names';
import ReactTable, { Column } from 'react-table';
import Dialog from 'material-ui/Dialog';
import { DialogTitle, DialogContent, DialogActions } from 'material-ui/Dialog';
import Button from 'material-ui/Button';

export interface IProps {
  onSelected?: (realm: IRealm) => void;
}

interface IState {
  realms: IRealm [];
  selected: IRealm|null;
}

export class RealmView extends React.Component<IProps, IState> {
  @lazyInject(AuthHandler)
  private auth!: AuthHandler;

  @lazyInject(Names)
  private names!: Names;

  constructor(props: IProps) {
    super(props);

    this.state = {
      realms: [],
      selected: null,
    };

    this.onClicked = this.onClicked.bind(this);
    this.onOkay = this.onOkay.bind(this);
  }

  public async componentDidMount() {
    this.auth.GetRealms().then((realms) => {
      this.setState({ realms });
    });
  }

  private onClicked(selected: IRealm) {
    this.setState({
      selected,
    });
  }

  private onOkay() {
    if (this.props.onSelected && this.state.selected) {
      this.props.onSelected(this.state.selected);
    }
  }

  public render() {
    const columns: Column[] = [
      {
        accessor: 'Name',
        width: 260,
        Header: (props: any, column: any) => (
          <div style={{ textAlign: 'left' }}>Realm Name</div>
        ),
      },
      {
        id: 'Type',
        Header: (props: any, column: any) => (
          <div style={{ textAlign: 'left' }}>Type</div>
        ),
        accessor: (props: IRealm) => {
          return this.names.RealmTypeToString(props);
        },
        width: 70,
        Cell: (props: any, column: any) => (
          <div
            style={{
              textAlign: 'center',
              color: `${props.original.Type === 1 ? 'red' : 'black'}`,
            }}
          >{props.value}
          </div>
        ),
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
        Cell: (row) => (
          <div>{row.value}</div>
        ),
      },
      {
        id: 'Population',
        Header: <div style={{ textAlign: 'left' }}>Population</div>,
        accessor: (props: IRealm) => {
          return this.names.RealmPopulationToString(props);
        },
        width: 100,
        Cell: (props: any, column: any) => (
          <div
            style={{
              textAlign: 'center',
              color: `${props.original.Population > 1.97 ? 'red' :
                (props.original.Population < 1.80 ? 'green' : 'black')}`,
            }}
          >{props.value}
          </div>
        ),
      }];

    return(
      <Dialog
        title='World of Warcraft'
        open={true}
      >
        <DialogTitle style={{textAlign: 'center'}}>
          {'World of Warcraft'}
        </DialogTitle>
        <DialogContent style={{ width: '520px', height: '400px', textAlign: 'center'}}>
          <ReactTable
            pageSize={10}
            data={this.state.realms}
            columns={columns}
            showPagination={false}
            className='-highlight'
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
                  background: (this.state.selected && rowInfo &&
                    this.state.selected === rowInfo.original) ? 'SkyBlue' : 'none',
                },
              };
            }}
            getTdProps={(state: any, rowInfo: any, column: any, instance: any) => {
              return {
                style: {
                  fontWeight: (this.state.selected && rowInfo &&
                    this.state.selected === rowInfo.original) ? 'bold' : 'normal',
                },
              };
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.onOkay}
            color='primary'
            disabled={this.state.selected === null}>
              Login
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
