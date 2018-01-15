import { Factory } from '../../interface/Factory';
import { Socket } from '../../interface/Socket';
import { MySocket } from './MySocket';

export class SocketFactory implements Factory<Socket> {
  public Create(): Socket {
    return new MySocket();
  }
}
