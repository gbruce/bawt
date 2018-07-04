import * as React from 'react';
import { lazyInject } from 'bawt/Container';
import { IHttpService } from 'interface/IHttpService';
import Card from 'material-ui/Card';
import { CardContent, CardMedia } from 'material-ui/Card';
import Typography from 'material-ui/Typography';

interface IProps {
  filePath: string;
}

export class BlpView extends React.Component<IProps, {}> {

  @lazyInject('IHttpService')
  public httpService!: IHttpService;

  constructor(props: IProps) {
    super(props);
  }

  public render() {
    const url = this.httpService.urlFromPath(this.props.filePath) + '.png';
    // return (<img src={url}></img>);
    return (
      <div>
        <Card>
          <CardMedia title='test'/>
          <img src={url}/>
          <CardContent>
            <Typography component='p'>
              Test2
            </Typography>
          </CardContent>
        </Card>
      </div>
    )
  }
}
