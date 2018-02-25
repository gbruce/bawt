import { Factory } from '../../interface/Factory';
import { Socket } from '../../interface/Socket';
import { SocketImpl } from './SocketImpl';

export class SocketFactory implements Factory<Socket> {
  public Create(): Socket {
    return new SocketImpl();
  }
}
