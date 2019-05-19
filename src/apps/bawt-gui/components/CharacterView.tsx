import * as React from 'react';
import { lazyInject } from 'bawt/Container';
import { GameHandler } from 'bawt/game/Handler';
import { AuthHandler } from 'bawt/auth/AuthHandler';
import { Names } from 'bawt/utils/Names';
import { IRealm } from 'interface/IRealm';
import { ICharacter } from 'interface/ICharacter';
import ReactTable, { Column, TableCellRenderer } from 'react-table';
import Dialog from 'material-ui/Dialog';
import { DialogTitle, DialogContent, DialogActions } from 'material-ui/Dialog';
import Button from 'material-ui/Button';

interface IProps {
  realm: IRealm;
  onSelected?: (Character: ICharacter) => void;
}

interface IState {
  characters: ICharacter [];
  selected: ICharacter|null;
}

export class CharacterView extends React.Component<IProps, IState> {
  @lazyInject(GameHandler)
  private game!: GameHandler;

  @lazyInject(AuthHandler)
  private auth!: AuthHandler;

  @lazyInject(Names)
  private names!: Names;

  constructor(props: IProps) {
    super(props);
    this.state = {
      characters: [],
      selected: null,
    };

    this.onClicked = this.onClicked.bind(this);
    this.onEnterWorld = this.onEnterWorld.bind(this);
  }

  public async componentDidMount() {
    if (this.auth.key === null) {
      return;
    }

    await this.game.connectToRealm(this.auth.key, this.props.realm);
    const characters: ICharacter[] = await this.game.getChars();
    this.setState({ characters });
  }

  private onClicked(selected: ICharacter) {
    this.setState({
      selected,
    });
  }

  private async onEnterWorld() {
    if (this.state.selected && this.props.onSelected) {
      await this.game.join(this.state.selected);
      this.props.onSelected(this.state.selected);
    }
  }

  public render() {
    const columns: Column[] = [
      {
        Header: (props: any, column: any) => (
          <div style={{ textAlign: 'left' }}>
          {this.props.realm.Name} {this.names.RealmTypeToString(this.props.realm)}
          </div>
        ),
        columns: [
          {
            accessor: 'Name',
            width: 180,
            Header: 'Name',
            Cell: (props: any, column: any) => (
              <div>{props.value}</div>
            ),
          },
          {
            accessor: 'Class',
            width: 100,
            Header: 'Class',
            Cell: (props: any, column: any) => (
              <div>{this.names.CharacterClassToString(props.original)}</div>
            ),
          },
          {
            accessor: 'Level',
            width: 100,
            Header: 'Level',
            Cell: (props: any, column: any) => (
              <div>Level {props.value}</div>
            ),
          },
          {
            accessor: 'Race',
            width: 100,
            Header: 'Race',
            Cell: (props: any, column: any) => (
              <div>{this.names.CharacterRaceToString(props.original)}</div>
            ),
          },
        ],
      },
    ];

    return(
      <Dialog
        title='World of Warcraft'
        open={true}
      >
        <DialogTitle style={{textAlign: 'center'}}>
          {'World of Warcraft'}
        </DialogTitle>
        <DialogContent style={{ width: '600px', minHeight: '450px'}}>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.onEnterWorld}
            color='primary'
            disabled={this.state.selected === null}>
              Enter World
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

/* insert between DialogContent
          <ReactTable
            pageSize={10}
            data={this.state.characters}
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
            >
          </ReactTable>
*/
