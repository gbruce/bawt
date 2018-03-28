import { injectable } from 'inversify';
import { ISocket } from 'interface/ISocket';
import { ISimpleEvent, SimpleEventDispatcher } from 'strongly-typed-events';
import { NewLogger } from 'bawt/utils/Logger';

const log = NewLogger('WebSocket');

enum SocketState {
  Disconnected,
  Connecting,
  Connected,
}

@injectable()
export class WSocket implements ISocket {
  private proxyHost: string = '127.0.0.1';
  private proxyPort: string = '9000';
  private onDataReceivedEvent: SimpleEventDispatcher<Buffer> = new SimpleEventDispatcher<Buffer>();
  private onPacketSentEvent: SimpleEventDispatcher<ArrayBuffer> = new SimpleEventDispatcher<ArrayBuffer>();
  private socket: WebSocket|null = null;
  private host: string = '';
  private port: number = 0;
  private state: SocketState = SocketState.Disconnected;

  public connect(host: string, port: number): Promise<void> {
    this.host = host;
    this.port = port;
    this.state = SocketState.Connecting;

    return new Promise((resolve, reject) => {
      const url = `ws://${this.proxyHost}:${this.proxyPort}/${host}:${port}`;
      this.socket = new WebSocket(url);
      this.socket.binaryType = 'arraybuffer';
      this.socket.addEventListener('open', (event) => {
        this.state = SocketState.Connected;
        resolve();
      });

      this.socket.addEventListener('message', (event) => {
        log.info('ondata ' + event.data.byteLength + ' bytes');
        this.onDataReceivedEvent.dispatch(new Buffer(event.data));
      });
    });
  }

  public disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.state === SocketState.Disconnected) {
        resolve();
      }

      if (this.socket !== null) {
        this.socket.addEventListener('close', (event) => {
          this.state = SocketState.Disconnected;
          this.socket = null;
          resolve();
        }, { once: true });
      }

      resolve();
    });
  }

  public sendBuffer(buffer: ArrayBuffer): boolean {
    if (this.state !==  SocketState.Connected || !this.socket) {
      return false;
    }

    this.socket.send(buffer);
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
