import { IFactory } from '../../interface/IFactory';
import { ISocket } from '../../interface/Socket';
import { SocketImpl } from './SocketImpl';

export class SocketFactory implements IFactory<ISocket> {
  public Create(): ISocket {
    return new SocketImpl();
  }
}
