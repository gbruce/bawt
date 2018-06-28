import * as React from 'react';
import { LoadDBC } from 'bawt/worker/LoadDBC';
import { lazyInject } from 'bawt/Container';
import { IHttpService } from 'interface/IHttpService';
import ReactTable, { Column, Filter } from 'react-table';

interface IProps {
  filePath: string;
}

export class DbcView extends React.Component<IProps, {}> {
  private fields: string[]|null = null;
  private values: any[]|null = null;

  @lazyInject('IHttpService')
  public httpService!: IHttpService;

  constructor(props: IProps) {
    super(props);
  }

  public async componentDidMount() {
    const loader = new LoadDBC(this.httpService);
    const dbcAsset = await loader.Start(this.props.filePath);
    this.fields = dbcAsset.fields;
    this.values = dbcAsset.records;
  }

  public render() {
    if (this.fields === null || this.values === null) {
      return(null);
    }

    const columns: Column[] = [];

    this.fields.forEach((field) => {
      columns.push({
        accessor: field,
        Header: (props: any, column: any) => (
          <div style={{ textAlign: 'left' }}>{field}</div>
        ),
      });
    });

    return (
      <ReactTable
        pageSize={10}
        data={this.values}
        showPagination={true}
        filterable
        className='-highlight'
        columns={columns}
        style={{
          height: '450px',
          width: '520px',
        }}
      />
    );
  }
}
