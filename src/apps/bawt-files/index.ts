import express from 'express';
import Pipeline from './pipeline';

export default class Server {
  private app: express.Application;
  constructor(private port: number, private root = process.cwd) {
    this.app = express();
    this.app.set('root', this.root);
    this.app.use(express.static('.'));
    this.app.use('/pipeline', new Pipeline().router);
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`Listening at http://localhost:${this.port}/`);
    });
  }
}

const server = new Server(8080);
server.start();
