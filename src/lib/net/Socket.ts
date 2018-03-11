import { injectable } from 'inversify';
import { Socket as NetSocket } from 'net';
import { ISimpleEvent, SimpleEventDispatcher } from 'strongly-typed-events';

import { ISocket } from '../../interface/ISocket';
import { NewLogger } from '../utils/Logger';

const log = NewLogger('MySocket');

enum SocketState {
  Disconnected,
  Connecting,
  Connected,
}

@injectable()
export class Socket implements ISocket {
  private onDataReceivedEvent: SimpleEventDispatcher<Buffer> = new SimpleEventDispatcher<Buffer>();
  private onPacketSentEvent: SimpleEventDispatcher<ArrayBuffer> = new SimpleEventDispatcher<ArrayBuffer>();
  private socket: NetSocket = new NetSocket();
  private host: string = '';
  private port: number = 0;
  private state: SocketState = SocketState.Disconnected;

  constructor() {
    this.socket.on('close', () => {
      this.state = SocketState.Disconnected;
    });

    this.socket.on('data', (data: Buffer) => {
      log.info('ondata ' + data.byteLength + ' bytes');
      this.onDataReceivedEvent.dispatch(data);
    });

    this.socket.on('error', (err: Error) => {
      log.error(err.message);
    });
  }

  public connect(host: string, port: number): Promise<void> {
    this.disconnect();

    this.host = host;
    this.port = port;
    this.state = SocketState.Connecting;

    return new Promise((resolve, reject) => {
      this.socket.connect(this.port, this.host, () => {
        this.state = SocketState.Connected;
        resolve();
      });
    });
  }

  public disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.state === SocketState.Disconnected) {
        resolve();
      }

      this.socket.once('close', () => {
        this.state = SocketState.Disconnected;
        resolve();
      });

      this.socket.destroy();
    });
  }

  public sendBuffer(buffer: ArrayBuffer): boolean {
    if (this.state !==  SocketState.Connected) {
      return false;
    }

    this.socket.write(buffer);
    this.onPacketSentEvent.dispatch(buffer);
    return true;
  }

  public get OnDataReceived(): ISimpleEvent<Buffer>
  {
    return this.onDataReceivedEvent.asEvent();
  }

  public get OnPacketSent(): ISimpleEvent<ArrayBuffer>
  {
    return this.onPacketSentEvent.asEvent();
  }
}
