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
  force: boolean;
  values: any[];
}

export class DbcView extends React.Component<IProps, IState> {
  private fields: string[]|null = null;

  @lazyInject('IHttpService')
  public httpService!: IHttpService;

  constructor(props: IProps) {
    super(props);

    this.state = {
      force: false,
      values: [],
    };
  }

  public async componentDidMount() {
    const loader = new LoadDBC(this.httpService);
    const dbcAsset = await loader.Start(this.props.filePath);
    if (dbcAsset) {
      this.fields = dbcAsset.fields;
      this.setState({
        values: dbcAsset.records,
      });
    }
    else {
      this.fields = [];
      this.setState({
        values: [],
      });
    }
  }

  public async componentWillUpdate(nextProps: IProps, nextState: IState) {
    if (nextProps.filePath !== this.props.filePath) {
      const loader = new LoadDBC(this.httpService);
      const dbcAsset = await loader.Start(nextProps.filePath);

      if (dbcAsset) {
        this.fields = dbcAsset.fields;
        this.setState({
          values: dbcAsset.records,
        });
      }
      else {
        this.fields = [];
        this.setState({
          values: [],
        });
      }
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
          const val: string = value[field];
          if (val) {
            const currentMax = val.toString().length;
            if (currentMax > max) {
              max = currentMax;
            }
          }
        });

        maxLines.set(field, max);
      }
    });

    this.fields.forEach((field) => {
      const maxCount = maxLines.get(field) || 5;
      const width =  Math.max(maxCount * 10, 50);
      columns.push({
        accessor: field,
        Header: (props: any, column: any) => (
          <div style={{ textAlign: 'left' }}>{field}</div>
        ),
        width,
      });
    });

    return (
      <ReactTable
        pageSize={10}
        data={this.state.values}
        showPagination={true}
        className='-highlight'
        columns={columns}
      />
    );
  }
}
