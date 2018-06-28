import * as React from 'react';
import { ThemeProvider } from 'styled-components';
import { MuiThemeProvider } from 'material-ui/styles';
import ReactTable, { Column, Filter } from 'react-table';
import { IHttpService } from 'interface/IHttpService';
import { lazyInject } from 'bawt/Container';
import { DbcView } from './DbcView';
import Grid from 'material-ui/Grid';
import { createMuiTheme } from 'material-ui/styles';
import blue from 'material-ui/colors/blue';

const theme = {
  main: 'mediumseagreen',
};

const theme2 = createMuiTheme({
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

    return (null);
  }

  public render() {
    const details = this.renderSelection();
    const columns: Column[] = [
      {
        accessor: 'name',
        width: 330,
        Header: (props: any, column: any) => (
          <div style={{ textAlign: 'left' }}>File Name</div>
        ),
        filterMethod: (filter: Filter, row: any, column: any) => {
          const name: string = row.name;
          return name.includes(filter.value);
        },
      },
    ];

    return (
      <ThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme2}>
          <div>
            <Grid container spacing={24}>
              <Grid item xs>
                <ReactTable
                  pageSize={10}
                  data={this.state.assets}
                  showPagination={true}
                  filterable
                  className='-highlight'
                  columns={columns}
                  style={{
                    height: '500px',
                    width: '330px',
        //            margin: 'auto',
                  }}
                  getTrProps={(state: any, rowInfo: any, column: any, instance: any) => {
                    return {
                      onClick: (e: any, handleOriginal: any) => {
                        this.onClicked(rowInfo.original);
                      },
                    };
                  }}
                  />
                </Grid>
              </Grid>
                {details}
          </div>
        </MuiThemeProvider>
      </ThemeProvider>
    );
  }
}
