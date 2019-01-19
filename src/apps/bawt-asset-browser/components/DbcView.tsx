import * as React from 'react';
import { LoadDBC } from 'bawt/worker/LoadDBC';
import { lazyInject } from 'bawt/Container';
import { IHttpService } from 'interface/IHttpService';
import ReactTable, { Column, Filter } from 'react-table';
import 'react-table/react-table.css';

interface IProps {
  filePath: string;
}

interface IState {
  values: any[];
  message: string|undefined;
  loading: boolean;
}

export class DbcView extends React.Component<IProps, IState> {
  private fields: string[]|null = null;

  @lazyInject('IHttpService')
  public httpService!: IHttpService;

  constructor(props: IProps) {
    super(props);

    this.state = {
      values: [],
      message: undefined,
      loading: false,
    };
  }

  private async loadData(filePath: string) {
    this.setState({
      loading: true,
    });

    const loader = new LoadDBC(this.httpService);
    let dbcAsset = null;
    let message;
    try {
      dbcAsset = await loader.Start(filePath);
    }
    catch (e) {
      message = e.message;
    }

    if (dbcAsset) {
      this.fields = dbcAsset.fields;
      this.setState({
        values: dbcAsset.records,
        loading: false,
      });
    }
    else {
      this.fields = [];
      this.setState({
        values: [],
        message,
        loading: false,
      });
    }
  }

  public async componentDidMount() {
    await this.loadData(this.props.filePath);
  }

  public async componentWillUpdate(nextProps: IProps, nextState: IState) {
    if (nextProps.filePath !== this.props.filePath) {
      await this.loadData(nextProps.filePath);
    }
  }

  public render() {
    if (this.fields === null || this.state.values === null) {
      return(null);
    }

    const columns: Column[] = [];
    const maxLines: Map<string, number> = new Map<string, number>();
    this.fields.forEach((field) => {
      if (this.state.values !== null) {
        let max: number = field.length;
        this.state.values.forEach((value) => {
          const val: any = value[field];
          if (val !== null && val !== undefined) {
            const currentMax = JSON.stringify(val).length;
            if (currentMax > max) {
              max = currentMax;
            }
          }
        });

        maxLines.set(field, max);
      }
    });

    this.fields.forEach((field) => {
      const padding = 5;
      const maxCount = maxLines.get(field) || 5;
      const width =  Math.max(maxCount * 8, 10) + padding * 2;

      columns.push({
        accessor: field,
        Header: (props: any, column: any) => (
          <div>{field}</div>
        ),
        Cell: (props: any, column: any) => (
          <div> {JSON.stringify(props.value)} </div>
        ),
        width,
        style: {
          fontFamily: 'monospace',
          textAlign: 'left',
          padding,
        },
        headerStyle: {
          textAlign: 'left',
          fontFamily: 'monospace',
        },
      });
    });

    return (
      <ReactTable
        pageSize={10}
        data={this.state.values}
        showPagination={true}
        className='-highlight -striped'
        columns={columns}
        noDataText={this.state.message}
        showPageSizeOptions={false}
        loading={this.state.loading}
      />
    );
  }
}
