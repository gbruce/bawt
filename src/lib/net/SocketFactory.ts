import { IFactory } from '../../interface/IFactory';
import { ISocket } from '../../interface/ISocket';
import { SocketImpl } from './SocketImpl';

export class SocketFactory implements IFactory<ISocket> {
  public Create(): ISocket {
    return new SocketImpl();
  }
}
