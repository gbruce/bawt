import * as React from 'react';
import { MuiThemeProvider } from 'material-ui/styles';
import ReactTable, { Column, Filter } from 'react-table';
import { IHttpService } from 'interface/IHttpService';
import { lazyInject } from 'bawt/Container';
import { DbcView } from './DbcView';
import { BlpView } from './BlpView';
import { M2View } from './M2View';
import Grid from 'material-ui/Grid';
import { createMuiTheme } from 'material-ui/styles';
import blue from 'material-ui/colors/blue';

const theme = createMuiTheme({
  palette: {
    primary: blue,
  },
});

interface IAsset {
  filename: string;
  name: string;
  size: number;
  link: string;
}

interface IState {
  assets: IAsset[];
  selected: IAsset|null;
}

export class Root extends React.Component<{}, IState> {
  @lazyInject('IHttpService')
  public httpService!: IHttpService;

  constructor(props: {}) {
    super(props);

    this.state = {
      assets: [],
      selected: null,
    };

    this.onClicked = this.onClicked.bind(this);
  }

  private onClicked(selected: IAsset) {
    this.setState({
      selected,
    });
  }

  public async componentDidMount() {
    const result = await this.httpService.getString('find/*');
    const deserialized = JSON.parse(result) as IAsset[];
    this.setState({ assets: deserialized });
  }

  private renderSelection() {
    if (this.state.selected === null) {
      return (null);
    }
    const asset = this.state.selected;
    if (asset.filename.endsWith('dbc')) {
      return (<DbcView filePath={asset.filename}/>);
    }
    else if (asset.filename.endsWith('blp') || asset.filename.endsWith('BLP')) {
      return (<BlpView filePath={asset.filename}/>);
    }
    else if (asset.filename.endsWith('m2') || asset.filename.endsWith('M2')) {
      return (<M2View filePath={asset.filename}/>);
    }

    return (null);
  }

  public render() {
    const details = this.renderSelection();
    const columns: Column[] = [
      {
        accessor: 'name',
        Header: (props: any, column: any) => (
          <div style={{ textAlign: 'left' }}>File Name</div>
        ),
        filterMethod: (filter: Filter, row: any, column: any) => {
          const name: string = row.name;
          return name.includes(filter.value);
        },
        style: {
          fontFamily: 'monospace',
          textAlign: 'left',
        },
        headerStyle: {
          textAlign: 'left',
          fontFamily: 'monospace',
        },
      },
    ];

    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <Grid container spacing={24} justify={'flex-start'} >
            <Grid item xs={12}>
              <Grid
                container
                spacing={16}
                alignItems={'flex-start'}
                direction={'row'}
                justify={'flex-start'}
              >
                <Grid item xs={3}>
                  <ReactTable
                    pageSize={10}
                    data={this.state.assets}
                    showPagination={true}
                    showPageSizeOptions={false}
                    filterable
                    className='-highlight'
                    columns={columns}
                    getTrProps={(state: any, rowInfo: any, column: any, instance: any) => {
                      return {
                        onClick: (e: any, handleOriginal: any) => {
                          this.onClicked(rowInfo.original);
                        },
                      };
                    }}
                  />
                </Grid>
                <Grid item xs={9}>
                  {details}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </MuiThemeProvider>
    );
  }
}
