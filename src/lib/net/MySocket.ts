import { Socket, SocketEvent } from '../../interface/Socket';
import { Socket as NetSocket } from 'net';
import { EventEmitter } from 'events';
import Packet from './Packet';
import { NewLogger } from '../utils/Logger';

const Log = NewLogger('MySocket');

enum SocketState {
  Disconnected,
  Connecting,
  Connected,
}

export class MySocket implements Socket {
  private socket: NetSocket = new NetSocket();
  private emitter: EventEmitter = new EventEmitter();
  private host: string;
  private port: number;
  private state: SocketState = SocketState.Disconnected;

  public connect(host: string, port: number): void {
    this.disconnect();

    this.host = host;
    this.port = port;
    this.state = SocketState.Connecting;

    this.socket.connect(this.port, this.host, () => {
      this.state = SocketState.Connected;
      this.emit(SocketEvent.OnConnected);
    });

    this.socket.on('close', () => {
      this.state = SocketState.Disconnected;
      this.emit(SocketEvent.OnDisconnected);
    });

    this.socket.on('data', (data: Buffer) => {
      Log.info('ondata ' + data.byteLength + ' bytes');
      this.emit(SocketEvent.OnDataReceived, data);
    });

    this.socket.on('error', (err: Error) => {
      Log.error(err.message);
    });
  }

  public disconnect(): void {
    if (this.state !== SocketState.Disconnected) {
      this.socket.end();
    }
  }

  public send(packet: Packet): boolean {
    if (this.state !==  SocketState.Connected) {
      return false;
    }

    packet.finalize();

    // Log.info(`==> [Packet opcode:${packet.opcodeName} size:${packet.capacity()}]`);

    this.socket.write(packet.buffer);
    this.emit(SocketEvent.OnDataSent, packet);
    return true;
  }

  public on(event: SocketEvent, listener: (...args: any[]) => void): void {
    this.emitter.on(event, listener);
  }

  private emit(event: SocketEvent, ...args: any[]): boolean {
    return this.emitter.emit(event, args);
  }
}