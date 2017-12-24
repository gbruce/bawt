import * as ByteBuffer from 'bytebuffer';
import { EventEmitter } from 'events';
import { Socket as NetSocket } from 'net';
import { default as Packet } from '../net/Packet';
import * as process from 'process';
import { NewLogger } from '../utils/Logger';

const Log = NewLogger('net/Socket');

// Base-class for any socket including signals and host/port management
class Socket extends EventEmitter {
  // Maximum buffer capacity
  // TODO: Arbitrarily chosen, determine this cap properly
  public static BUFFER_CAP: number = 2048;

  protected host: string|null;
  protected port: any;
  protected buffer: ByteBuffer;
  private uri: any;
  private socket: NetSocket;
  private remaining: boolean;
  private socketOpen: boolean = false;

  // Creates a new socket
  constructor() {
    super();

    // Holds the host, port and uri currently connected to (if any)
    this.host = null;
    this.port = NaN;
    this.uri = null;

    // Holds buffered data
    this.buffer = new ByteBuffer(0, ByteBuffer.LITTLE_ENDIAN, false);

    // Holds incoming packet's remaining size in bytes (false if no packet is being handled)
    this.remaining = false;
  }

  // Whether this socket is currently connected
  get connected() {
    return this.socketOpen;
  }

  // Connects to given host through given port (if any; default port is implementation specific)
  public connect(host: string, port: number = NaN) {
    if (!this.connected) {
      this.host = host;
      this.port = port;
      this.uri = this.host + ':' + this.port;
      this.remaining = false;

      this.socket = new NetSocket();
      this.socket.connect(this.port, this.host, () => {
        this.socketOpen = true;
        this.emit('connect');
      });

      this.socket.on('close', () => {
        this.socketOpen = false;
        this.emit('disconnect');
      });

      this.socket.on('data', (data: Buffer) => {
        Log.info('ondata ' + data.byteLength + ' bytes');
        const index = this.buffer.offset;
        this.buffer.append(data);

        // this.buffer.index = index;

        this.emit('data:receive', data);

        if (this.buffer.remaining() === 0 && this.buffer.capacity() > Socket.BUFFER_CAP) {
           this.buffer.reset();
        }
      });

      this.socket.on('error', (err: Error) => {
        this.socketOpen = false;
        Log.error(err.message);
      });
    }

    return this;
  }

  // Attempts to reconnect to cached host and port
  public reconnect() {
    if (!this.connected && this.host && this.port) {
      this.connect(this.host, this.port);
    }
    return this;
  }

  // Disconnects this socket
  public disconnect() {
    if (this.connected) {
      this.socket.end();
    }
    return this;
  }

  // Finalizes and sends given packet
  public send(packet: Packet) {
    if (this.connected) {
      packet.finalize();

      Log.info('==> ', packet.toString() + ' size:' + packet.capacity());

      this.socket.write(packet.buffer);
      this.emit('packet:send', packet);
      return true;
    }

    return false;
  }
}

export default Socket;
