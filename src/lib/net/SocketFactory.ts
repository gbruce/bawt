import { IFactory } from '../../interface/IFactory';
import { ISocket } from '../../interface/ISocket';
import { Socket } from './SocketImpl';

export class SocketFactory implements IFactory<ISocket> {
  public Create(): ISocket {
    return new Socket();
  }
}
